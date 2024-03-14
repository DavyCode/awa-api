import mongoose from 'mongoose';
import debug from 'debug';
import { promisify } from 'util';
import { DBURL } from '../../config/env';
import RedisService from './redis.services';
import CacheService from '../cache.service';
import { MongooseObjectId } from '../../common/types/mongoose.types';

const log: debug.IDebugger = debug('app:mongoose-service');

// @ts-expect-error
const dburi: string = DBURL;

mongoose.Promise = require('bluebird');

const redisClient = RedisService.getRedis();
const redisGetAsync = promisify(redisClient.get).bind(redisClient);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options: any = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    log('Do not Use cache');
    return exec.apply(this);
  }

  log(`hashKey:: ${this.hashKey}`);

  // check if query key exist in cache
  const cacheValue = await redisGetAsync(`${this.hashKey}`);

  if (cacheValue) {
    log(`cacheValue:: ===FROM CACHE====`);

    const doc = JSON.parse(cacheValue);

    // mongoose exec function expects to return a model instance of mongoose document
    // also we handle cases where query result is either an object or array
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  // else proceed to mongoose to fetch query
  const result = await exec.apply(this);

  if (result && result !== null) {
    // store result into cache
    await CacheService.setCache(`${this.hashKey}`, JSON.stringify(result), 15);
  }

  log(`cacheValue:: ====FROM DB====`);

  return result;
};


class MongooseService {
  private count = 0;
  private mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 0,
    keepAlive: true,
  };

  db: any;

  constructor() {
    this.connectWithRetry();
  }

  getMongoose() {
    return mongoose;
  }

  validMongooseObjectId(id: string | MongooseObjectId) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  connectWithRetry = () => {
    log('Attempting MongoDB connection (will retry if needed)');

    mongoose.connect(dburi, this.mongooseOptions);
    this.db = mongoose.connection;

    this.db.on('error', (err: any) => {
      const retrySeconds = 5;
      log('There was a db connection error', err);

      log(
        `MongoDB connection unsuccessful (will retry #${++this
          .count} after ${retrySeconds} seconds):`,
        err,
      );
      setTimeout(this.connectWithRetry, retrySeconds * 1000);
    });

    this.db.once('connected', () => {
      log('DB connection created successfully!');
    });

    this.db.once('disconnected', () => {
      log('DB connection disconnected!');
    });

    process.on('SIGINT', () => {
      mongoose.connection.close();

      process.exit(0);
    });
  };
}

export default new MongooseService();