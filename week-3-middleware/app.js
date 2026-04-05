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

global.user_id = null;
global.users = [];
global.tasks = [];
// const {user_id, users, tasks} = global;

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
  //should i be running a check here to see if the user already exists? or just add them to the users array?
  //check to sanitize?
  // const id = uuidv4();
  const newUser = { ...req.body };
  global.users.push(newUser);
  global.user_id = newUser.name;
  delete req.body.password;
  res.status(StatusCodes.CREATED).json({ message: ReasonPhrases.OK, newUser });
});

const server = app.listen(port, () =>
  console.log(`Server listening on port ${port}...`),
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
