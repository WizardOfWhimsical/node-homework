function checkAuthorization(req, res, next) {
  if (global.user_id) {
    res
      .status(401)
      .json({ message: "Unathorized", error: "User is not Authorized Access" });
  }
  next();
}

module.exports = checkAuthorization;
