const { requestLogger, responseLogger } = require("./logger");
const errorHandler = require("./error-handler");
const authMiddleware = require("./auth");
const notFound = require("./not-found");
const getPrismaErrorInfo = require("./customPrismaErrorHandling/getPrismaErrorInfo");

module.exports = {
  requestLogger,
  responseLogger,
  errorHandler,
  authMiddleware,
  notFound,
  getPrismaErrorInfo,
};
