const {
  StatusCodes,
  // getReasonPhrase,
  ReasonPhrase,
} = require("http-status-codes");

function register(req, res) {
  const newUser = { ...req.body, isLoggedIn: true };
  global.users.push(newUser);
  global.user_id = newUser;
  delete newUser.password;
  res
    .status(StatusCodes.CREATED)
    .json({ message: newUser, reason: ReasonPhrase.CREATED });
}
