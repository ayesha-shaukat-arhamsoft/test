const mongoose = require("mongoose");

/**
 * Email Schema
 * @private
 */
const Email = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

/**
 * @typedef Email
 */

module.exports = mongoose.model("Email", Email);
