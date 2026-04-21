const { StatusCodes } = require("http-status-codes");
const { userSchema } = require("../validation/userSchema");

const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

async function register(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Validation Error", error: error.message });
  }

  for (let user of global.users) {
    if (value.email === user.email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email already used to create an account",
        error: "Bad Request",
      });
    }
  }

  try {
    const hashedPassword = await hashPassword(value.password);
    const newUser = {
      ...value,
      password: hashedPassword,
      isLoggedIn: true,
    };
    global.users.push(newUser);
    global.user_id = newUser;
  } catch (error) {
    return res
      .status(StatusCodes.INSUFFICIENT_STORAGE)
      .json({ message: "Problem hashing password", error: error.message });
  } finally {
    delete req.body.password;
    res.status(StatusCodes.CREATED).json({
      ...req.body,
      message: "Account Created",
    });
  }
}

async function logon(req, res) {
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
  const compairison = await comparePassword(password, user.password);
  if (!compairison) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication Failed",
    });
  }

  user.isLoggedIn = true;
  global.user_id = user;
  res.status(StatusCodes.OK).json({
    name: user.name,
    email: user.email,
    message: "logged in",
  });
}

function logoff(req, res) {
  global.user_id = null;
  res.status(StatusCodes.OK).json({ message: "logged out" });
}

module.exports = { register, logon, logoff };
