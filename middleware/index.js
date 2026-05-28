const { requestLogger, responseLogger, logger } = require("./logger");
const errorHandler = require("./error-handler");
const handleAuthMiddleware = require("./jwtMiddleware");
const notFound = require("./not-found");
const getPrismaErrorInfo = require("./customPrismaErrorHandling/getPrismaErrorInfo");
const setUniqueId = require("../week-3-middleware/middleware/uniqueId");

module.exports = {
  logger,
  setUniqueId,
  requestLogger,
  responseLogger,
  errorHandler,
  handleAuthMiddleware,
  notFound,
  getPrismaErrorInfo,
};
