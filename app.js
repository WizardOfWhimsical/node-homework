const {
  morgan,
  express,
  StatusCodes,
  prisma,
  cookieParser,
  helmet,
  xss,
  rateLimiter,
} = require("./index");
const {
  setUniqueId,
  requestLogger,
  responseLogger,
  errorHandler,
  notFound,
} = require("./middleware");
const { userRouter, taskRouter, analyticsRouter } = require("./routes");

const app = express();
const port = process.env.PORT || 3000;

app.set("trust proxy", 1);

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

app.use(
  morgan("dev"),
  express.urlencoded({ extended: true }),
  express.json(),
  cookieParser(),
  helmet(),
  xss(),
  setUniqueId,
  requestLogger,
  responseLogger,
);

app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/analytics", analyticsRouter);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(StatusCodes.OK).json({ status: "OK", db: "connected" });
  } catch (error) {
    console.error("Error in health check:", error);
    res.status(500).json({ status: "Error" });
  }
});

app.use(notFound, errorHandler);

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
