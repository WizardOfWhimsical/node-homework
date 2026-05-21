const { requestLogger, responseLogger } = require("./logger");
const errorHandler = require("./error-handler");
const authMiddleware = require("./auth");
const notFound = require("./not-found");
const getPrismaErrorInfo = require("./customPrismaErrorHandling/getPrismaErrorInfo");
const setUniqueId = require("../week-3-middleware/middleware/uniqueId");

module.exports = {
  setUniqueId,
  requestLogger,
  responseLogger,
  errorHandler,
  authMiddleware,
  notFound,
  getPrismaErrorInfo,
};
