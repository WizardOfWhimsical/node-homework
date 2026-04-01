const express = require("express");
const morgan = require("morgan");
const errorHandler = require("./middleware/error-handler");
const notFound = require("./middleware/not-found");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(notFound);
//basic error handling
app.use(errorHandler);

const server = app.listen(port, () => console.log(`Listening @ port ${3000}`));

module.exports = { app, server };
