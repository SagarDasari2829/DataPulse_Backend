const User = require("../models/User");
const { signAuthToken } = require("../utils/jwt");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const buildAuthResponse = (user) => ({
  message: "Authentication successful.",
  token: signAuthToken(user),
  user: user.toSafeObject(),
});

const register = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = new User({ name, email });
    user.setPassword(password);
    await user.save();

    return res.status(201).json({
      message: "User registered successfully.",
      token: signAuthToken(user),
      user: user.toSafeObject(),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user." });
  }
};

const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: "Failed to log in." });
  }
};

const logout = async (req, res) => {
  try {
    req.user.tokenVersion += 1;
    await req.user.save();

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to log out." });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({ user: req.user.toSafeObject() });
};

module.exports = {
  getCurrentUser,
  login,
  logout,
  register,
};
