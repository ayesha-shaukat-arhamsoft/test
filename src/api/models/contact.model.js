const mongoose = require("mongoose");

/**
 * Contact Schema
 * @private
 */
const Contact = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String },
    status: { type: Number, default: 1 }, // 0 == In Progress, 1 == Pending, 2 == Closed
  },
  { timestamps: true }
);

/**
 * @typedef Contact
 */

module.exports = mongoose.model("Contact", Contact);
