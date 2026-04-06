global.user_id = null;
global.users = [
  {
    name: "stephen Lewis",
    email: "st.butHole.gole.com",
    password: "stupidPeople",
    isLoggedIn: false,
    _id: "73241",
    todos: ["one thing", "2 things", 3],
  },
];
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
// 5. 404 handler (after all routes)
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: ReasonPhrases.NOT_FOUND,
    reason: `Route ${req.method} ${req.path} not found`,
  });
});

// 6. Error handler (last - catches all errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
  });
});

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
