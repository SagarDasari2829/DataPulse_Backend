const jwt = require("jsonwebtoken");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return process.env.JWT_SECRET;
};

const signAuthToken = (user) =>
  jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );

const verifyAuthToken = (token) => jwt.verify(token, getJwtSecret());

module.exports = {
  signAuthToken,
  verifyAuthToken,
};
