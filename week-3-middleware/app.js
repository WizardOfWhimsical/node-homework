const express = require("express");
// const { v4: uuidv4 } = require("uuid");
const uniqueId = require("./middleware/uniqueId");
const loggingOperations = require("./middleware/logOperations");
const notFound = require("../middleware/not-found");
const serverError = require("../middleware/error-handler");

const path = require("path");
const dogsRouter = require("./routes/dogs");
const { StatusCodes } = require("http-status-codes");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static("./public"));
app.use(uniqueId, loggingOperations);
// Your middleware here

app.use("/", dogsRouter); // Do not remove this line

const server = app.listen(3000, () =>
  console.log("Server listening on port 3000"),
);

app.use(serverError);
app.use(notFound);

module.exports = server;
