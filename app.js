require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsMiddleware = (req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
    if (requestOrigin) {
      res.header("Access-Control-Allow-Origin", requestOrigin);
      res.header("Vary", "Origin");
    }

    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
};

app.use(corsMiddleware);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "DataPulse backend is running." });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error.message);
  res.status(500).json({ message: "Internal server error." });
});

module.exports = app;
