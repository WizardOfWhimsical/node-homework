const { StatusCodes } = require("../index");
const { userSchema } = require("../validation/userSchema");
const prisma = require("../db/prisma");

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

async function register(req, res, next) {
  if (!req.body) req.body = {};
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.log("Validation failed");
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }

  value.hashedPassword = await hashPassword(value.password);
  delete value.password;
  let user = null;

  try {
    const { name, email, hashedPassword } = value;
    user = await prisma.user.create({
      data: { name, email, hashedPassword },
      select: { name: true, email: true, id: true },
    });
  } catch (e) {
    if (e.name === "PrismaClientKnownRequestError" && e.code === "P2002") {
      return res.status(400).json({ message: "Email already registered" });
    } else {
      return next(e);
    }
  }
  global.user_id = user.id;
  console.log("User Registered\n", user);
  return res.status(201).json({
    name: user.name,
    email: user.email,
  });
}

async function logon(req, res) {
  if (!req.body) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Your Request has no information",
      error: "Bad request",
    });
  }
  let { email, password } = req.body;
  // if (!email || !password) {
  //   return res.status(StatusCodes.BAD_REQUEST).json({
  //     message: "Email and Password are required",
  //     error: "Bad request",
  //   });
  // }
  email = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Please Register an Account",
    });
  }
  const compairison = await comparePassword(password, user.hashedPassword);

  if (!compairison) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication Failed",
    });
  }

  user.isLoggedIn = true;
  global.user_id = user.id;
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
