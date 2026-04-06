const {
  StatusCodes,
  // getReasonPhrase,
  ReasonPhrases,
} = require("http-status-codes");

function logoff(req, res) {
  global.user_id = null;
  res
    .status(StatusCodes.OK)
    .json({ message: ReasonPhrases.OK, reason: "Successful logout" });
}

module.exports = logoff;
