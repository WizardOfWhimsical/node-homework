const { StatusCodes } = require("../index");

function notFound(err, req, res, next) {
  console.log("Erroring, Not found page:\n", req.url);
  return res.status(StatusCodes.NOT_FOUND).json({
    error: `You can't do a ${req.method} for ${req.url}`,
    requestId: `${req.requestId}`,
  });
}
module.exports = notFound;
