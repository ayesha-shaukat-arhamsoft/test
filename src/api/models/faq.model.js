const mongoose = require("mongoose");

/**
 * FAQ Schema
 * @private
 */
const FAQ = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    catId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaqCategory",
      required: true,
    },
    desc: { type: String, required: true, default: "" },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * @typedef FAQ
 */

module.exports = mongoose.model("FAQ", FAQ);
