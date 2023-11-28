const mongoose = require("mongoose");

/**
 * BlogCategory Schema
 * @private
 */
const BlogCategory = new mongoose.Schema(
  {
    category: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    status: { type: Boolean, default: false },
    isHighlighted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * @typedef BlogCategory
 */

module.exports = mongoose.model("BlogCategory", BlogCategory);
