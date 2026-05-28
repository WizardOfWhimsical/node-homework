const { StatusCodes, prisma, jwt, crypto, util } = require("../index");
const { userSchema } = require("../validation/userSchema");
const { getPrismaErrorInfo } = require("../middleware/index");

const scrypt = util.promisify(crypto.scrypt);
const { randomUUID } = crypto;

/**
 * @param {String} password
 * @returns string salted/hashed
 */
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * @param {String}
 * @param {String}
 * @returns boolean of comparison
 */
async function comparePassword(inputPassword, storedHash) {
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

/**
 *
 * @param {Object} req - The Express request object.
 * @returns
 * Object {{
 *    httpOnly:boolean,
 *    secure: boolean,
 *    sameSite: string
 *     }}
 */
function cookieFlags(req) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };
}

/**
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {object} user {{unknown}}
 * @returns string
 */
function setJwtCookie(req, res, user) {
  const payload = { id: user.id, csrfToken: randomUUID() };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.cookie("jwt", token, { ...cookieFlags(req), maxAge: 3600000 });
  return payload.csrfToken;
}

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
async function register(req, res, next) {
  if (!req.body) req.body = {};

  const { error, value } = userSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.details,
    });
  }

  value.hashedPassword = await hashPassword(value.password);
  delete value.password;

  let result = null;

  try {
    const { name, email, hashedPassword } = value;

    result = await prisma.$transaction(async (txt) => {
      const user = await txt.user.create({
        data: { email, name, hashedPassword },
        select: { id: true, email: true, name: true },
      });

      const welcomeTaskData = [
        { title: "Complete your profile", userId: user.id, priority: "medium" },
        { title: "Add your first task", userId: user.id, priority: "high" },
        { title: "Explore the app", userId: user.id, priority: "low" },
      ];

      await txt.task.createMany({ data: welcomeTaskData });

      const welcomeTasks = await txt.task.findMany({
        where: {
          userId: user.id,
          title: { in: welcomeTaskData.map((t) => t.title) },
        },
        select: {
          id: true,
          title: true,
          isCompleted: true,
          userId: true,
          priority: true,
        },
      });

      return { user, welcomeTasks };
    });
  } catch (err) {
    if (err.name === "PrismaClientKnownRequestError" && err.code === "P2002") {
      return res.status(400).json({ message: "Email already registered" });
    } else {
      getPrismaErrorInfo(err);
      return next(err);
    }
  }

  const csrfToken = setJwtCookie(req, res, result.user);

  return res.status(StatusCodes.CREATED).json({
    user: result.user,
    csrfToken,
    welcomeTasks: result.welcomeTasks,
    transactionStatus: "success",
  });
}

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
async function logon(req, res, next) {
  if (!req.body) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Your Request has no information",
      error: "Bad request",
    });
  }

  let { email, password } = req.body;
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Email and Password are required",
      error: "Bad request",
    });
  }

  email = email.toLowerCase();
  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        hashedPassword: true,
      },
    });
  } catch (err) {
    getPrismaErrorInfo(err);
    return next(err);
  }
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

  const csrfToken = setJwtCookie(req, res, user);

  res.status(StatusCodes.OK).json({
    name: user.name,
    email: user.email,
    csrfToken,
    message: "logged in",
  });
}
/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
async function show(req, res, next) {
  const user_id = parseInt(req.user.id);
  if (!user_id) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No user logged in", error: "Bad Request" });
  } else if (isNaN(user_id)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Invalid user id" });
  }

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        Task: {
          where: { isCompleted: false },
          selecet: {
            id: true,
            title: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createAt: "desc" },
          take: 5,
        },
      },
    });
  } catch (err) {
    getPrismaErrorInfo(err);
    if (err.name === "P2003") {
      return res.status(400).json({ message: "User does not exist" });
    } else {
      return next(err);
    }
  }
  return res.status(StatusCodes.OK).json({ user });
}

async function logoff(req, res) {
  res.clearCookie("jwt", cookieFlags(req));
  return res.status(StatusCodes.OK).json({ message: "logged out" });
}

module.exports = { register, logon, logoff, show };
