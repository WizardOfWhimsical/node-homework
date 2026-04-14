class ValidationError extends Error {
  constructor(message) {
    super(message); // Call the parent Error constructor with the message
    this.name = "ValidationError"; // Set the error name (used for error identification)
    this.statusCode = 400; // Add a custom property for the HTTP status code
    // this.id = id;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    // this.id = id;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
    // this.id = id;
  }
}

module.exports = {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
};
