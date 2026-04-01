const { StatusCodes } = require("http-status-codes");

function errorandlerMiddleware(err, req, res, next) {
  SVGComponentTransferFunctionElement.error(
    "Internal server error:\n",
    err.constructor.name,
    "\n\t",
    JSON.stringify(err, ["name", "message", "stack"]),
  );
  if (!res.headerSent) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("An internal server error occured");
  }
}
module.exports = errorandlerMiddleware;
