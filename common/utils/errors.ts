import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import APIError from './APIError';
import ServerResponseStatus from '../constant/responseStatus';
import { NODE_ENV } from '../../config/env';

export class UnauthorizedError extends APIError {
  constructor(message: string) {
    super(ServerResponseStatus.UNAUTHORIZED, message);
  }
}

export class BadRequestError extends APIError {
  constructor(message: string) {
    super(ServerResponseStatus.BAD_REQUEST, message);
  }
}

export class NotFoundError extends APIError {
  constructor(message: string) {
    super(ServerResponseStatus.NOT_FOUND, message || 'Not Found');
  }
}

export class InternalServerError extends APIError {
  constructor(message: string) {
    super(ServerResponseStatus.INTERNAL_SERVER_ERROR, message);
  }
}

export class TooManyRequestError extends APIError {
  constructor(message: string) {
    super(ServerResponseStatus.TOO_MANY_REQUESTS, message);
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string) {
    super(ServerResponseStatus.FORBIDDEN, message);
  }
}

export class PaymentRequiredError extends APIError {
  constructor(message: string) {
    super(ServerResponseStatus.PAYMENT_REQUIRED, message);
  }
}

export class NotAcceptableError extends APIError {
  constructor(message: string) {
    super(ServerResponseStatus.NOT_ACCEPTABLE, message);
  }
}

export const errorHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  /**
   * log the error message, and meta object
   */
  let respondWith = {
    errors: [error.message ? error.message : 'Something went wrong'],
    statusCode: error.statusCode
      ? error.statusCode
      : ServerResponseStatus.INTERNAL_SERVER_ERROR,
    status: ServerResponseStatus.RESPONSE_STATUS_FAILURE,
  };

  if (NODE_ENV === 'development' && !(error instanceof APIError)) {
    respondWith = Object.assign({}, respondWith, { stack: error.stack });
  }

  if (NODE_ENV === 'production' && !(error instanceof APIError)) {
    // Push to logger in production
  }

  if (NODE_ENV === 'development') {
    winston.error(error.message, error);
  }

  response
    .status(
      error.statusCode
        ? error.statusCode
        : ServerResponseStatus.INTERNAL_SERVER_ERROR,
    )
    .json(respondWith);
};
