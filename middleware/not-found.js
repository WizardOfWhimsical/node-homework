const { StatusCodes } = require("http-status-codes");

function notFound(req, res) {
  console.log("Erroring, Not found page:\n", req.url);
  return res
    .status(StatusCodes.NOT_FOUND)
    .send(`You can't do a ${req.method} for ${req.url}`);
}
module.exports = notFound;
