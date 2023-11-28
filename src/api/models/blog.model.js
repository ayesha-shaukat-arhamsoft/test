const mongoose = require("mongoose");

/**
 * Blog Schema
 * @private
 */
const Blog = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
    featuredImage: { type: String, required: true },
    featuredImageLocal: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * @typedef Blog
 */

module.exports = mongoose.model("Blog", Blog);
