const { crypto, jwt } = require("../index");
const { randomUUID } = crypto;
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
// eslint-disable-next-line no-unused-vars
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

module.exports = { setJwtCookie, cookieFlags };
