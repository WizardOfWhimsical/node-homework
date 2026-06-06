const { randomUUID } = require("crypto");

function setUniqueId(req, res, next) {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
}
module.exports = setUniqueId;
