const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
//basic error handling
app.use((err, req, res, next) => {
  console.log("Express Server Error Response\n", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});

const server = app.listen(port, () => console.log(`Listening @ port ${3000}`));

module.exports = { app, server };
