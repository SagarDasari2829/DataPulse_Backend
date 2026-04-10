const express = require("express");
const {
  getCurrentUser,
  login,
  logout,
  register,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;
