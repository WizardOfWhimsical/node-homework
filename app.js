const express = require("express");
const morgan = require("morgan");
const {
  StatusCodes,
  // getReasonPhrase,
  ReasonPhrase,
} = require("http-status-codes");
const errorHandler = require("./middleware/error-handler");
const notFound = require("./middleware/not-found");

global.user_id = null;
global.users = [];
global.taskes = [];

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use((req, res, next) => {
  console.log("-----------");
  console.log(
    "Middleware to log request:\n",
    "\tMethod:",
    req.method,
    "\n",
    "\tPath:",
    req.path,
    "\n",
    "\tQuery:",
    req.query,
  );
  console.log("-----------");
  next();
});
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.post("/testpost", (req, res) => {
  console.log("post request body:\n", req.body);
  res
    .status(StatusCodes.OK)
    .json({ message: "Test Post Hit", reason: ReasonPhrase.OK });
});

app.post("/api/users/register", (req, res) => {
  const newUser = { ...req.body, isLoggedIn: true };
  global.users.push(newUser);
  global.user_id = newUser;
  delete newUser.password;
  res
    .status(StatusCodes.CREATED)
    .json({ message: newUser, reason: ReasonPhrase.CREATED });
});

app.use(notFound);
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
