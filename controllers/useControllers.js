const {
  StatusCodes,
  // getReasonPhrase,
  ReasonPhrase,
} = require("http-status-codes");

function register(req, res) {
  console.log("Register Request Body\n", req.body);
  const newUser = { ...req.body, isLoggedIn: true };
  global.users.push(newUser);
  global.user_id = newUser;
  console.log("Register New User\n", newUser);
  delete newUser.password;
  res
    .status(StatusCodes.CREATED)
    .json({ message: newUser, reason: ReasonPhrase.CREATED });
}

function logon(req, res) {
  console.log("Logon Request Body:\n", req.body);

  const { email, password } = req.body;
  const user = global.users.find((user) => user.email === email);
  if (!user) {
    console.log("user not found");
    return res.status(StatusCodes.NOT_FOUND).json({
      reason: ReasonPhrase.NOT_FOUND,
      message: "Please Register an Account",
    });
  }

  if (password !== user.password) {
    console.log("wrong password");
    return res.status(StatusCodes.UNAUTHORIZED).json({
      reason: ReasonPhrase.UNAUTHORIZED,
      message: "Authentication Failed",
    });
  } else if (password === user.password) {
    console.log("login successful");
    user.isLoggedIn = true;
    global.user_id = user;
    console.log("official user\n", user);
    delete user.password;
    res.status(StatusCodes.ACCEPTED).json({
      reason: ReasonPhrase.ACCEPTED,
      message: "Successfully logged in",
      user,
    });
  }
}

function logoff(req, res) {
  global.user_id = null;
  res
    .status(StatusCodes.OK)
    .json({ reason: ReasonPhrase.OK, message: "Logout Successful" });
}

module.exports = { register, logon, logoff };
