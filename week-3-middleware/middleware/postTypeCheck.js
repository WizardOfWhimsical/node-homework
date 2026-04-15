const { StatusCodes } = require("http-status-codes");
function postTypeCheck(req, res, next) {
  if (req.method !== "POST") next();

  const contentType = req.get("Content-Type");

  if (!contentType || !contentType.includes("application/json")) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Content-Type must be application/json",
      requestId: req.requestId,
    });
  }
  next();
}
module.exports = postTypeCheck;
