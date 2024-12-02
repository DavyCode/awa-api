import 'express-async-errors';
import express from 'express';
import * as http from 'http';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import debug from 'debug';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import RateLimiterMiddleware from '../common/middleware/rateLimiter.middleware';

import headerOptions from './headerOptions';
import { errorHandler } from '../common/utils/errors';
import CheckHeaders from '../modules/auth/middleware/checkHeaders';
import { CommonRoutesConfig } from '../common/common.routes.config';
import { UsersRoutes } from '../modules/users/users.routes.config';
import { AuthRoutes } from '../modules/auth/auth.routes.config';
import { PlanRoutes } from '../modules/valueBar/plan.routes.config';

import {
  logResponseBody,
  logAccessStream,
  // appExpressErrorWinston,
  // appExpressWinston,
} from './logging';

const app: express.Application = express();
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(cors());
app.enable('trust proxy'); //: https://express-rate-limit.github.io/ERR_ERL_PERMISSIVE_TRUST_PROXY/
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

// You can also enable pre-flight across-the-board like so:
// app.options('*', cors()) // include before other routes

try {
  if (process.env.NODE_ENV == 'production') {
    app.use(logAccessStream());
  }
} catch (ex: any) {
  console.log(ex);
}

const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true }),
  ),
};

if (process.env.DEBUG) {
  process.on('unhandledRejection', function (reason) {
    debugLog('Unhandled Rejection:', reason);
    process.exit(1);
  });
} else {
  loggerOptions.meta = false;
}

app.use(logResponseBody);

app.use(headerOptions);

app.use(expressWinston.logger(loggerOptions));

app.all(
  '/*',
  CheckHeaders.checkHeadersForAuthorization,
  RateLimiterMiddleware.limitRate,
);

try {
  if (process.env.NODE_ENV === 'production') {
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs..
      }),
    );
  }
} catch (ex: any) {
  console.log(ex);
}

app.use(expressWinston.logger(loggerOptions));
// app.use(appExpressWinston);

routes.push(new UsersRoutes(app));
routes.push(new AuthRoutes(app));
routes.push(new PlanRoutes(app));

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('Full authentication is required');
});

app.use(errorHandler);

// express-winston errorLogger makes sense AFTER the router.
// app.use(appExpressErrorWinston as any);

export { app as default, routes };
