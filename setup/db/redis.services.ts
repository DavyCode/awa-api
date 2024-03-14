import { createClient } from "redis";
import URL from "url";
import debug from "debug";
import chalk from "chalk";
import { REDIS_URL } from "../../config/env";

const log: debug.IDebugger = debug("app:redis-service");

// @ts-expect-error
const redis_url: string = REDIS_URL;

// use a connection string in the format redis[s]://[[username][:password]@][host][:port][/db-number]:
const connectionStr = URL.parse(redis_url);

class RedisService {
	redis: any;

	constructor() {
		this.connectWithRetry();
	}

	getRedis() {
		return this.redis;
	}

	connectWithRetry() {
		log(chalk.bold.red(`Attempting REDIS connection (will retry if needed)`));

		const redisClient: any = createClient({
			url: connectionStr.href,
			legacyMode: true,
		});

		this.redis = redisClient;

		this.redis.on("error", (err: any) => {
			log(chalk.bold.red(`REDIS Error 🔥 ${err}`));
		});

		this.redis.connect();

		this.redis.on("connect", () => {
			log(chalk.bold.red(`REDIS CLIENT CONNECTED successfully 🔥🔥`));
		});
	}
}

export default new RedisService();
