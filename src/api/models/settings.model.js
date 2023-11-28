const mongoose = require("mongoose");

/**
 * Settings Schema
 * @private
 */
const Settings = new mongoose.Schema(
  {
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: {
      type: Object,
      default: {
        lat: { type: Number, default: 0 },
        lat: { type: Number, default: 0 },
      },
    },

    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
    pinterest: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    facebook: { type: String, default: "" },

    desc: { type: String, default: "" },
    domain: { type: String, default: "" },
    api: { type: String, default: "" },

    stripeProductKeys: { type: Object },
    webhookSecret: { type: String },
  },
  { timestamps: true }
);

/**
 * @typedef Settings
 */

module.exports = mongoose.model("Settings", Settings);
