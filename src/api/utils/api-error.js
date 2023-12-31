const httpStatus = require("http-status");

/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor({ message, errors, status, isPublic, stack }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true; // this is required since bluebird 4 doesn't append it anymore.
    this.stack = stack;
  }
}

/**
 * class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  /**
   * creates an API error.
   * @param {string} message - error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - whether the message should be visible to user or not.
   */
  constructor({
    message,
    errors,
    stack,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
  }) {
    super({
      message,
      errors,
      status,
      isPublic,
      stack,
    });
  }
}

module.exports = APIError;
