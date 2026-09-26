class AppError extends Error {
  // `code` is an optional machine-readable identifier (e.g. 'EMAIL_HAS_ACCOUNT').
  // The client branches on it instead of string-matching `message`.
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    if (code) this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Something went wrong!';

  // console.error(`Error : [${statusCode}] :`, message);
  // console.log({err})

  res.status(statusCode).json({
    status,
    message,
    ...(err.code ? { code: err.code } : {})
  });
};

module.exports = { AppError, catchAsync, globalErrorHandler };