class APIError extends Error {
  statusCode: number;
  constructor(statusCode = 500, message = `Unknown Server Error.`, data = {}) {
    super(message);
    this.statusCode = statusCode;
  }
}

export { APIError as default };
