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

server.on("error", (err) => {
  if (err.code === "EADDRINUSE")
    console.error(`Port ${port} is already in use.`);
  else console.log("Server error:\n", err);

  process.exit(1);
});

let isShuttingDown = false;
async function shutdown(code = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("Shutting down gracefully...");
  try {
    await new Promise((resolve) => server.close(resolve));
    console.log("HTTP server closed.");
    //close db connections here
  } catch (err) {
    console.error("Error during shutdown:\n", err);
    code = 1;
  } finally {
    console.log("Exiting Process...");
    process.exit(code);
  }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:\n", err);
  shutdown(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("unhandled rejection:\n", reason);
  shutdown(1);
});

module.exports = { app, server };
