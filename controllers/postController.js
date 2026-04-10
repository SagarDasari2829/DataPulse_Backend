const axios = require("axios");
const Post = require("../models/Post");

const POSTS_SOURCE_URL = "https://jsonplaceholder.typicode.com/posts";
let syncInFlight = null;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const upsertPosts = async (posts) => {
  const operations = posts.map((post) => ({
    updateOne: {
      filter: { externalId: post.id || post.externalId },
      update: {
        $set: {
          category: post.category || "Post",
          title: post.title,
          body: post.body,
          externalId: post.id || post.externalId,
        },
      },
      upsert: true,
    },
  }));

  return Post.bulkWrite(operations, { ordered: false });
};

const syncPostsFromExternalAPI = async () => {
  try {
    const { data } = await axios.get(POSTS_SOURCE_URL, {
      timeout: 10000,
    });

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("No posts received from external API.");
      return { inserted: 0, updated: 0, totalFetched: 0 };
    }

    const result = await upsertPosts(data);

    return {
      inserted: result.upsertedCount || 0,
      updated: result.modifiedCount || 0,
      totalFetched: data.length,
    };
  } catch (error) {
    console.error("Failed to sync posts from external API:", error.message);

    const existingCount = await Post.countDocuments();

    if (existingCount > 0) {
      return {
        inserted: 0,
        updated: 0,
        totalFetched: existingCount,
      };
    }

    return {
      inserted: 0,
      updated: 0,
      totalFetched: 0,
    };
  }
};

const ensurePostsAvailable = async () => {
  const existingCount = await Post.countDocuments();

  if (existingCount > 0) {
    return existingCount;
  }

  if (!syncInFlight) {
    syncInFlight = syncPostsFromExternalAPI().finally(() => {
      syncInFlight = null;
    });
  }

  await syncInFlight;
  return Post.countDocuments();
};

const getAllPosts = async (req, res) => {
  try {
    await ensurePostsAvailable();
    const posts = await Post.find().sort({ externalId: 1 });
    return res.status(200).json(posts);
  } catch (error) {
    console.error("Failed to fetch posts:", error.message);
    return res.status(500).json({ message: "Failed to fetch posts." });
  }
};

const getPostById = async (req, res) => {
  try {
    await ensurePostsAvailable();
    const { id } = req.params;
    const post = /^\d+$/.test(id)
      ? await Post.findOne({ externalId: Number(id) })
      : await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    return res.status(200).json(post);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid post id." });
    }

    console.error("Failed to fetch post:", error.message);
    return res.status(500).json({ message: "Failed to fetch post." });
  }
};

const searchPostsByTitle = async (query) => {
  const normalizedQuery = String(query || "").trim();

  if (!normalizedQuery) {
    return Post.find().sort({ externalId: 1 }).lean();
  }

  return Post.find({
    title: { $regex: escapeRegex(normalizedQuery), $options: "i" },
  })
    .sort({ externalId: 1 })
    .lean();
};

module.exports = {
  getAllPosts,
  getPostById,
  searchPostsByTitle,
  syncPostsFromExternalAPI,
};
