const {
  StatusCodes,
  getReasonPhrase,
  ReasonPhrases,
} = require("http-status-codes");

function register(req, res) {
  const newUser = { ...req.body };
  global.users.push(newUser);
  global.user_id = newUser.name;
  delete req.body.password;
  return res
    .status(StatusCodes.CREATED)
    .json({ message: ReasonPhrases.OK, newUser });
}

module.exports = register;
