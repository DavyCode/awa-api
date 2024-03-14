import { Request, Response, NextFunction } from 'express';
import debug from 'debug';
import RedisService from '../../setup/db/redis.services';

import {
  ForbiddenError,
  InternalServerError,
  TooManyRequestError,
} from '../utils/errors';

const log: debug.IDebugger = debug('app:rateLimiter-middleware');

const redisClient = RedisService.getRedis();

class RateLimiterMiddleware {
  async limitRate(req: Request, res: Response, next: NextFunction) {
    let token = req.headers['x-forwarded-for']; // get the unique identifier for the user here
    if (!token) {
      token = req.connection.remoteAddress;
    }
    if (!token) {
      return res.status(403).send({
        errors: ['Unidentifiable entity'],
        statusCode: 403,
        status: 'failure',
      });
    }

    // I am using token here but it can be ip address, API_KEY, etc
    await redisClient
      .multi() // starting a transaction
      .set([token, 0, 'EX', 60, 'NX']) // SET UUID 0 EX 60 NX
      .incr(token) // INCR UUID
      .exec((err: any, replies: number[]) => {
        if (err) {
          return res.status(500).send({
            errors: [err.message],
            statusCode: 500,
            status: 'failure',
          });
        }

        if (replies[1] > 40) {
          return res.status(429).send({
            errors: ['Quota Exceeded'],
            statusCode: 429,
            status: 'failure',
          });
        }
        return next();
      });
  }

  async limitRouteRequest(req: Request, res: Response, next: NextFunction) {
    let token = req.headers['x-forwarded-for']; // get the unique identifier for the user here
    if (!token) {
      token = req.connection.remoteAddress;
    }

    if (!token) {
      return res.status(403).send({
        errors: ['Unidentifiable entity'],
        statusCode: 403,
        status: 'failure',
      });
    }

    await redisClient
      .multi() // starting a transaction
      .set([token, 0, 'EX', 60, 'NX']) // SET UUID 0 EX 60 NX
      .incr(token) // INCR UUID
      .exec((err: { message: any }, replies: number[]) => {
        if (err) {
          return res.status(500).send({
            errors: [err.message],
            statusCode: 500,
            status: 'failure',
          });
        }

        if (replies[1] > 40) {
          return res.status(429).send({
            errors: ['Quota Exceeded'],
            statusCode: 429,
            status: 'failure',
          });
        }
        return next();
      });
  }

  async limitPaymentRequest(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.jwt; // get the unique identifier for the user here

    if (!user) {
      return res.status(403).send({
        errors: ['Unidentifiable entity'],
        statusCode: 403,
        status: 'failure',
      });
    }

    const token = user.userId;
    if (!token) {
      return res.status(403).send({
        errors: ['Unidentifiable entity'],
        statusCode: 403,
        status: 'failure',
      });
    }

    await redisClient
      .multi()
      .set([token, 0, 'EX', 60, 'NX']) // SET UUID 0 EX 60 NX
      .incr(token) // INCR UUID
      .exec((err: { message: any }, replies: number[]) => {
        if (err) {
          return res.status(500).send({
            errors: [err.message],
            statusCode: 500,
            status: 'failure',
          });
        }

        if (replies[1] > 2) {
          return res.status(429).send({
            errors: ['Quota Exceeded'],
            statusCode: 429,
            status: 'failure',
          });
        }
        return next();
      });
  }
}

export default new RateLimiterMiddleware();
