const { jwt, StatusCodes } = require("../index");

function send401(res) {
  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: "No user is authenticatd" });
}
const validateUserId = (req, res, next) => {
  const user_id = parseInt(req?.user?.id);

  if (!user_id) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No user logged in", error: "Bad Request" });
  } else if (isNaN(user_id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Something went wrong with the request",
      error: "Invalid user id",
    });
  }
  return next();
};

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
module.exports = { handleAuthMiddleware, validateUserId };
