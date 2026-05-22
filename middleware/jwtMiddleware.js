const { jwt, StatusCodes } = require("../index");

function send401(res) {
  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: "No user is authenticatd" });
}

async function handleAuthMiddleware(req, res, next) {
  const token = req?.cookies?.jwt;
  if (!token) return send401(res);

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return send401(res);

    req.user = { id: decoded.id };

    if (["POST", "PATCH", "DELETE", "CONNECT"].includes(req.method)) {
      if (req.get("X-CSRF-TOKEN") != decoded.csrfToken) {
        return send401(res);
      }
    }
    next();
  });
}
module.exports = handleAuthMiddleware;
