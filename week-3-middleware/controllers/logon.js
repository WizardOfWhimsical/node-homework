const {
  StatusCodes,
  // getReasonPhrase,
  ReasonPhrases,
} = require("http-status-codes");

function logon(req, res) {
  console.log("----------");
  console.log(global.users);
  console.log("----------");
  const { email, password } = req.body;
  const user = global.users.find((user) => user.email === email);
  console.log(user);
  console.log("---------");
  if (!user) {
    console.log("user not found in DB");
    return res.send(StatusCodes.NOT_FOUND).json({
      message: ReasonPhrases.NOT_FOUND,
      reason: "Please Register an account",
    });
  }
  // if (user.email === email) {
  if (user.password !== password) {
    console.log("seems to be the wrong password");
    return res.send(StatusCodes.NOT_ACCEPTABLE).json({
      message: ReasonPhrases.NOT_ACCEPTABLE,
      reason: "Invalid Password",
    });
  } else if (user.password === password) {
    console.log("login successful");
    const userNoPW = { ...user, password: "No lookie Lou's" };
    return res
      .send(StatusCodes.OK)
      .json({ message: ReasonPhrases.OK, user: userNoPW });
  }
  // }
}

module.exports = logon;
