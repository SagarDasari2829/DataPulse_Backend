const express = require("express");
const { getAllPosts, getPostById } = require("../controllers/postController");

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);

module.exports = router;
