const { crypto, util } = require("../index");

const scrypt = util.promisify(crypto.scrypt);

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

module.exports = { hashPassword, comparePassword };
