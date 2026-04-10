const User = require("../models/User");
const { verifyAuthToken } = require("../utils/jwt");

const extractBearerToken = (authorizationHeader = "") => {
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const authenticateToken = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Token has been invalidated. Please log in again." });
    }

    req.user = user;
    req.auth = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You are not authorized to access this resource." });
  }

  return next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
