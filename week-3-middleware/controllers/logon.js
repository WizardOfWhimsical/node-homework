const {
  StatusCodes,
  // getReasonPhrase,
  ReasonPhrases,
} = require("http-status-codes");

function logon(req, res) {
  const { email, password } = req.body;
  const user = global.users.find((user) => user.email === email);
  if (!user) {
    console.log("user not found in DB");
    return res.status(StatusCodes.NOT_FOUND).json({
      message: ReasonPhrases.NOT_FOUND,
      reason: "Please Register an account",
    });
  }
  // global.current.user = user;
  global.user_id = user;
  if (password !== user.password) {
    console.log("seems to be the wrong password");
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: ReasonPhrases.UNAUTHORIZED,
      reason: "Authentication Failed",
    });
  } else if (password === user.password) {
    console.log("login successful");

    const userNoPW = {
      ...user,
      isLoggedIn: !user.isLoggedIn,
    };
    delete userNoPW.password;
    return res
      .status(StatusCodes.OK)
      .json({ message: ReasonPhrases.OK, user: userNoPW });
  }
}

module.exports = logon;
