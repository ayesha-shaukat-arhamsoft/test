const mongoose = require("mongoose");

/**
 * FaqCategory Schema
 * @private
 */
const FaqCategory = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true, default: "" },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * @typedef FaqCategory
 */

module.exports = mongoose.model("FaqCategory", FaqCategory);
