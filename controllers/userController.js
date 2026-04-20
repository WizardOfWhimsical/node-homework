const { StatusCodes } = require("http-status-codes");

function register(req, res) {
  if (!req.body) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Your Request has no information",
      error: "Bad request",
    });
  }

  const newUser = { ...req.body, isLoggedIn: true };

  for (let user of global.users) {
    if (newUser.email === user.email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email already used to create an account",
        error: "Bad Request",
      });
    }
  }

  global.users.push(newUser);
  global.user_id = newUser;
  console.log("Register New User\n", newUser);
  delete req.body.password;
  res.status(StatusCodes.CREATED).json({
    ...req.body,
    message: "Account Created",
  });
}

function logon(req, res) {
  if (!req.body) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Your Request has no information",
      error: "Bad request",
    });
  }
  const { email, password } = req.body;
  const user = global.users.find((user) => user.email === email);

  if (!user) {
    console.log("user not found");
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Please Register an Account",
    });
  }

  if (password !== user.password) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication Failed",
    });
  } else if (password === user.password) {
    console.log("login successful");
    user.isLoggedIn = true;
    global.user_id = user;
    res.status(StatusCodes.OK).json({
      name: user.name,
      email: user.email,
      message: "logged in",
    });
  }
}

function logoff(req, res) {
  global.user_id = null;
  res.status(StatusCodes.OK).json({ message: "logged out" });
}

module.exports = { register, logon, logoff };
