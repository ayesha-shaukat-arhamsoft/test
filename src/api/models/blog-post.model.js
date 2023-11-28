const mongoose = require("mongoose");
const moment = require("moment");

/**
 * BlogPost Schema
 * @private
 */
const BlogPost = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tags: { type: Array, default: [] },
    blogId: { type: mongoose.Schema.Types.ObjectId, required: true },
    readCount: { type: Number, default: 0 },
    featuredImage: { type: String },
    featuredImageLocal: { type: String },
    published: { type: Boolean, default: false },
    publishDate: { type: Date, default: moment(Date.now()) },
  },
  { timestamps: true }
);

/**
 * @typedef BlogPost
 */

module.exports = mongoose.model("BlogPost", BlogPost);
