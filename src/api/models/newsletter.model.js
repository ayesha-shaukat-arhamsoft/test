const mongoose = require("mongoose");

/**
 * Newsletter Schema
 * @private
 */
const Newsletter = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    ip: { type: String, required: true },
  },
  { timestamps: true }
);

/**
 * @typedef Newsletter
 */

module.exports = mongoose.model("Newsletter", Newsletter);
