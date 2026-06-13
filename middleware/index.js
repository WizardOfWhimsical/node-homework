const { requestLogger, responseLogger, logger } = require("./logger");
const errorHandler = require("./error-handler");
const { handleAuthMiddleware, validateUserId } = require("./jwtMiddleware");
const notFound = require("./not-found");
const getPrismaErrorInfo = require("./customPrismaErrorHandling/getPrismaErrorInfo");
const setUniqueId = require("./uniqueId");

module.exports = {
  logger,
  setUniqueId,
  requestLogger,
  responseLogger,
  errorHandler,
  handleAuthMiddleware,
  validateUserId,
  notFound,
  getPrismaErrorInfo,
};
