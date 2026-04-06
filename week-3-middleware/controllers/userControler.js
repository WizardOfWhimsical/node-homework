const {
  StatusCodes,
  // getReasonPhrase,
  ReasonPhrases,
} = require("http-status-codes");
const logon = require("../controllers/logon");
const logoff = require("../controllers/logout");

//should i be running a check here to see if the user already exists? or just add them to the users array?
//check to sanitize?
// const id = uuidv4();

function register(req, res) {
  const newUser = { ...req.body, isLoggedIn: !req.body.isLoggedIn };
  global.users.push(newUser);
  global.user_id = newUser.name;
  delete req.body.password;
  return res
    .status(StatusCodes.CREATED)
    .json({ message: ReasonPhrases.OK, newUser });
}

module.exports = { register, logon, logoff };
