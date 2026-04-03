const express = require("express");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const dogsRouter = require("./routes/dogs");

const app = express();

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// Your middleware here

app.use((req, res, next) => {
  console.log(
    "Coming/Going:\n",
    `\t${new Date().toLocaleString()}: ${req.method} ${req.path}`,
  );
  next();
});

app.use("/", dogsRouter); // Do not remove this line

const server = app.listen(3000, () =>
  console.log("Server listening on port 3000"),
);
// 5. 404 handler (after all routes)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 6. Error handler (last - catches all errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = server;
