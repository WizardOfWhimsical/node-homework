global.user_id = null;
// global.current.user = {};
global.users = [];
global.tasks = [];
// const {user_id, users, tasks} = global;

const express = require("express");
const {
  StatusCodes,
  getReasonPhrase,
  ReasonPhrases,
} = require("http-status-codes");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// const register = require("./controllers/userControler");
const useRoute = require("./routes/useRoutes");
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

// app.post("/api/user/register", register);
app.use("/api/users", useRoute);

const server = app.listen(port, () =>
  console.log(`Server listening on port ${port}...`),
);

module.exports = server;

/**
 * user of users
 * const shape_of_obj = {
 *    name: string,
 *    email: string,
 *    password: string,
 *    isLoggedIn: boolean,
 *    _id: string,
 *    todos: [],
 * }
 */
