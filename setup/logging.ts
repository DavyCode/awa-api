/**
 * catch async errors with express-async-errors
 */
import 'express-async-errors';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import logger from 'morgan';
import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import expressWinston from 'express-winston';
/**
 * Requiring `winston-mongodb` will expose `winston.transports.MongoDB`..
 */
import 'winston-mongodb';

import {
  LOGS_DBURL,
  NODE_ENV,
  // CLOUDWATCH_GROUP_NAME,
  // CLOUDWATCH_GROUP_STREAM,
  // CLOUDWATCH_ACCESS_KEY,
  // CLOUDWATCH_SECRET_ACCESS_KEY,
  // CLOUDWATCH_REGION,
  // NODE_ENV_CLOUDWATCH,
} from '../config/env';

// @ts-expect-error
const db: string = LOGS_DBURL;

// class SystemLogger {
const logging = () => {
  /** Write unhandled exception to logs/uncaughtExceptions.log file */
  winston.exceptions.handle(
    new winston.transports.Console({}),
    new winston.transports.File({ filename: 'logs/uncaughtExceptions.log' }),
    new winston.transports.MongoDB({
      db: db,
      storeHost: true,
      tryReconnect: true,
    }),
  );

  /** Exit process on unhandled promise Rejection */
  process.on('unhandledRejection', (ex: any) => {
    winston.error(ex.message, ex);
    process.exit(1);
  });

  winston.configure({
    transports: [
      /**
       * Logs errors to console in development
       * Logs errors to logs/error.log & DB in prod
       * Logs info to logs/logFile.log
       */
      NODE_ENV !== 'production'
        ? new winston.transports.Console({
            level: 'debug',
          })
        : new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),

      new winston.transports.MongoDB({
        db: db,
        level: 'error',
        storeHost: true,
        tryReconnect: true,
      }),

      new winston.transports.File({
        filename: 'logs/logFile.log',
        level: 'info',
        format: winston.format.json(),
      }),
    ],
  });
};

const systemLogger = new (winston.createLogger as any)({
  format: winston.format.json(),
  transports: [],
});

let appExpressWinston: any;
let appExpressErrorWinston: any;

try {
  if (NODE_ENV == 'production') {
    // systemLogger.add(
    //   new WinstonCloudWatch({
    //     logGroupName: CLOUDWATCH_GROUP_NAME,
    //     logStreamName: `${CLOUDWATCH_GROUP_STREAM}-${NODE_ENV_CLOUDWATCH}`,
    //     awsAccessKeyId: CLOUDWATCH_ACCESS_KEY,
    //     awsSecretKey: CLOUDWATCH_SECRET_ACCESS_KEY,
    //     awsRegion: CLOUDWATCH_REGION,
    //     // retentionInDays: 30,
    //     messageFormatter: ({ level, message, additionalInfo }) =>
    //       `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(
    //         additionalInfo,
    //       )}}`,
    //   }),
    // );
  }

  if (NODE_ENV === 'development' || NODE_ENV === 'DEBUG') {
    systemLogger.add(
      new (winston.transports.Console as any)({
        timestamp: new Date().toISOString(),
        colorize: true,
      }),
    );
  }

  // const expressCloudwatchConfig = {
  //   logGroupName: CLOUDWATCH_GROUP_NAME,
  //   logStreamName: `${CLOUDWATCH_GROUP_STREAM}-${NODE_ENV_CLOUDWATCH}`,
  //   awsAccessKeyId: CLOUDWATCH_ACCESS_KEY,
  //   awsSecretKey: CLOUDWATCH_SECRET_ACCESS_KEY,
  //   awsRegion: CLOUDWATCH_REGION,
  //   // retentionInDays: 30,
  //   messageFormatter: ({ level, message, additionalInfo }: any) =>
  //     `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(
  //       additionalInfo,
  //     )}}`,
  // };

  // /** appExpressWinston */
  // appExpressWinston = expressWinston.logger({
  //   transports: [
  //     // new winston.transports.Console()
  //     new WinstonCloudWatch(expressCloudwatchConfig as any),
  //   ],
  //   format: winston.format.combine(
  //     winston.format.colorize(),
  //     winston.format.json(),
  //   ),
  //   meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  //   // msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  //   // msg: "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}} {{req.headers}}",
  //   expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  //   colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  //   ignoreRoute: function (req, res) {
  //     return false;
  //   }, // optional: allows to skip some log messages based on request and/or response
  // });

  // /**
  //  * appExpressErrorWinston
  //  */
  // // express-winston errorLogger makes sense AFTER the router.
  // appExpressErrorWinston = expressWinston.errorLogger({
  //   transports: [
  //     // new winston.transports.Console(),
  //     new WinstonCloudWatch(expressCloudwatchConfig),
  //   ],
  //   msg: '{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',

  //   format: winston.format.combine(
  //     winston.format.colorize(),
  //     winston.format.json(),
  //   ),
  // });
} catch (ex: any) {
  winston.error('Could not initiate Cloud watch connection :', ex?.message);
}

const logResponseBody = (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldWrite = res.write;
    const oldEnd = res.end;

    const chunks: any[] = [];

    res.write = (...restArgs: any): any => {
      chunks.push(Buffer.from(restArgs[0]));
      oldWrite.apply(res, restArgs as any);
    };

    res.end = (...restArgs: any): any => {
      if (restArgs[0]) {
        chunks.push(Buffer.from(restArgs[0]));
      }
      const body = Buffer.concat(chunks).toString('utf8');

      const excludedUrl = [
        `/xyz/v1/users`, // TODO - attend to this
      ];

      if (req.originalUrl.substring(0, 14) !== '/xyz/v1/users') {
        // TODO - attend to this
        if (!excludedUrl.includes(req.originalUrl)) {
          // hide header authorization && API KEY third party from lOGs...
          const { authorization, ...rest } = req.headers;

          systemLogger.log(
            'info',
            `RESPONDING ${req.method} ${req.originalUrl}`,
            {
              tags: 'https',
              additionalInfo: {
                REQUEST: {
                  body: req.body,
                  headers: rest,
                  query: req.query,
                  params: req.params,
                },
                RESPONSE: {
                  time: new Date().toUTCString(),
                  fromIP:
                    req.headers['x-forwarded-for'] ||
                    req.connection.remoteAddress,
                  method: req.method,
                  originalUri: req.originalUrl,
                  uri: req.url,
                  requestData: req.body,
                  responseData: body,
                  referer: req.headers.referer || '',
                  ua: req.headers['user-agent'],
                },
              },
            },
          );
        } else {
          console.log('&&=######4%%$$##====###===', 'DO NOT LOG');
        }
      } else {
        console.log('&&=######4%%$$##====###===', 'DO NOT LOG');
      }

      /**
       * @todo -- log error
       */
      oldEnd.apply(res, restArgs as any);
    };

    next();
  } catch (ex: any) {
    winston.error('ERROR inside logResponseBody function :', ex.message);
  }
};

const logAccessStream = () => {
  const accessLogStream = fs.createWriteStream('./logger/access.log', {
    flags: 'a',
  });

  return logger(
    '{"remote_addr": ":remote-addr", "remote_user": ":remote-user", "date": ":date[clf]", "method": ":method", "url": ":url", "http_version": ":http-version", "status": ":status", "result_length": ":res[content-length]", "referrer": ":referrer", "user_agent": ":user-agent", "response_time": ":response-time"}',
    {
      stream: accessLogStream,
    },
  );
};

export {
  // appExpressWinston,
  // appExpressErrorWinston,
  logAccessStream,
  logResponseBody,
  systemLogger,
  logging as default,
};
