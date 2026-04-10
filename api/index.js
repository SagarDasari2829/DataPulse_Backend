const app = require("../app");
const connectDB = require("../config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Serverless request failed:", error.message);
    return res.status(500).json({ message: "Failed to initialize backend." });
  }
};
