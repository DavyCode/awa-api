import httpStatus from 'http-status';

const ServerResponseStatus = {
  RESPONSE_STATUS_FAILURE: 'error',
  RESPONSE_STATUS_SUCCESS: 'success',
  OK: httpStatus.OK,
  CREATED: httpStatus.CREATED,
  INTERNAL_SERVER_ERROR: httpStatus.INTERNAL_SERVER_ERROR,
  NOT_FOUND: httpStatus.NOT_FOUND,
  FAILED: httpStatus.BAD_REQUEST,
  BAD_REQUEST: httpStatus.BAD_REQUEST,
  UNAUTHORIZED: httpStatus.UNAUTHORIZED,
  TOO_MANY_REQUESTS: httpStatus.TOO_MANY_REQUESTS,
  FORBIDDEN: httpStatus.FORBIDDEN,
  PAYMENT_REQUIRED: httpStatus.PAYMENT_REQUIRED,
  NOT_ACCEPTABLE: httpStatus.NOT_ACCEPTABLE,
};

export default ServerResponseStatus;
