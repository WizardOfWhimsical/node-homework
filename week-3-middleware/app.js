const express = require("express");
const uniqueId = require("./middleware/uniqueId");
const loggingOperations = require("./middleware/logOperations");
const securityHeaders = require("./middleware/additionalHeaders");
const { NotFoundError } = require("./error");
const { StatusCodes } = require("http-status-codes");
const dogsRouter = require("./routes/dogs");

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

app.use((req, res, next) => {
  next(new NotFoundError("Route not found"));
});
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 400 && statusCode < 500) {
    console.warn(`WARN: ${err.name} ${err.message}`);
  } else {
    console.error(`ERROR: Error ${err.message}`);
  }
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    requestId: req.requestId,
  });
});

module.exports = server;
