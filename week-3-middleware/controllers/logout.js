const {
  StatusCodes,
  // getReasonPhrase,
  ReasonPhrases,
} = require("http-status-codes");

function logout(req, res) {
  global.user_id = null;
  res
    .status(StatusCodes.OK)
    .json({ message: StatusCodes.OK, reason: "Successful logout" });
}

module.exports = logout;
