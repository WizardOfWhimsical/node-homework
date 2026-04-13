const express = require("express");
// const { v4: uuidv4 } = require("uuid");
const uniqueId = require("./middleware/uniqueId");
const loggingOperations = require("./middleware/logOperations");
const notFound = require("../middleware/not-found");
const serverError = require("../middleware/error-handler");
const securityHeaders = require("./middleware/additionalHeaders");
// const path = require("path");
const dogsRouter = require("./routes/dogs");
const { StatusCodes } = require("http-status-codes");

const app = express();

app.use(uniqueId, loggingOperations);
app.use(securityHeaders);
app.use(express.json({ limit: "1mb" }));
app.use(express.static("./public"));

app.use((req, res, next) => {
  if (req.method !== "POST") next();

  const contentType = req.get("Content-Type");

  if (!contentType || !contentType.includes("application/json")) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Content-Type must be application/json",
      requestId: req.requestId,
    });
  }
  next();
});

app.use("/", dogsRouter); // Do not remove this line

const server = app.listen(3000, () =>
  console.log("Server listening on port 3000"),
);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 400 && statusCode < 500) {
    console.warn(`WARN: ${err.name}`, err.message);
  } else {
    console.error(`ERROR: Error`, err.message);
  }
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    requestID: req.requestId,
  });
});
app.use(serverError);
app.use(notFound);

module.exports = server;
