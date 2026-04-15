const express = require("express");
const setUniqueId = require("./middleware/uniqueId");
const viewLoggingOperations = require("./middleware/logOperations");
const setSecurityHeaders = require("./middleware/additionalHeaders");
const extendedErrorHandling = require("./middleware/customErrorHandling");
const postTypeCheck = require("./middleware/postTypeCheck");
const { NotFoundError } = require("./error");
const dogsRouter = require("./routes/dogs");

const app = express();

app.use(setUniqueId, viewLoggingOperations, setSecurityHeaders);
app.use(express.json({ limit: "1mb" }));
app.use(express.static("./public"));

app.use(postTypeCheck);

app.use("/", dogsRouter); // Do not remove this line

const server = app.listen(3000, () =>
  console.log("Server listening on port 3000"),
);

app.use((req, res, next) => {
  next(new NotFoundError("Route not found"));
});
app.use(extendedErrorHandling);

module.exports = server;
