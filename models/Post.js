const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      trim: true,
      default: "Post",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    externalId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
