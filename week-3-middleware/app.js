const express = require("express");
const {
  StatusCodes,
  getReasonPhrase,
  ReasonPhrases,
} = require("http-status-codes");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const dogsRouter = require("./routes/dogs");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(morgan("dev")); // logger for colored output on http success/fail

// Your middleware here

app.use((req, res, next) => {
  console.log(
    "Coming/Going:\n",
    `\t${new Date().toLocaleString()}: ${req.method} ${req.path}`,
  );
  next();
});

app.use("/", dogsRouter); // Do not remove this line
app.post("/api/user/register", (req, res) => {
  const payload = req.body;
  res.status(StatusCodes.CREATED).json({ message: ReasonPhrases.OK, payload });
});
const server = app.listen(port, () =>
  console.log("Server listening on port 3000"),
);
// 5. 404 handler (after all routes)
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({ message: ReasonPhrases.NOT_FOUND });
});

// 6. Error handler (last - catches all errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
  });
});

module.exports = server;
