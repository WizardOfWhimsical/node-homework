const { morgan, express, StatusCodes } = require("./index");
const { requestLogger, responseLogger } = require("./middleware/logger");
const errorHandler = require("./middleware/error-handler");
const authMiddleware = require("./middleware/auth");
const notFound = require("./middleware/not-found");
// const pool = require("./db/pg-pool");
const prisma = require("./db/prisma");
const useRouter = require("./routes/useRoutes");
const taskRouter = require("./routes/taskRoutes");

global.user_id = null;
global.users = [];
global.taskes = [];

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(requestLogger, responseLogger);

app.use("/api/users", useRouter);
app.use("/api/tasks", authMiddleware, taskRouter);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    // await pool.query("SELECT 1");
    res.status(StatusCodes.OK).json({ status: "OK", db: "connected" });
  } catch (error) {
    console.error("Error in health check:", error);
    res.status(500).json({ status: "Error" });
  }
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
    // await pool.end();
    await prisma.$disconnect();
    console.log("Prisma Disconnected");
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
