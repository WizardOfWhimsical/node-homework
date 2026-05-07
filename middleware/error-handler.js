const { StatusCodes } = require("../index");

function errorhandlerMiddleware(err, req, res, next) {
  if (err.code === "ECONNREFUSED" && err.PORT === 5432) {
    console.log("The darabase connection was refused, is it running?");
  }
  console.error(
    "Internal server error:\n",
    err.constructor.name,
    "\n",
    JSON.stringify(err, ["name", "message", "stack"]),
  );
  if (!res.headerSent) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("An internal server error occured");
  }
}
module.exports = errorhandlerMiddleware;
