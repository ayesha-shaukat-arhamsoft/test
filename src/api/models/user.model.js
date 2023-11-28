const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const moment = require("moment-timezone");
const jwt = require("jwt-simple");
const {
  pwdSaltRounds,
  jwtExpirationInterval,
  pwEncryptionKey,
  uploadedImgPath,
} = require("../../config/var");

/**
 * User Schema
 * @private
 */
const User = new mongoose.Schema(
  {
    fullName: { type: String },
    dob: { type: Date },
    phone: { type: String },
    customerId: { type: String },
    address: { type: String },
    referralKey: { type: String },
    refferedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    status: { type: Boolean, default: true },
    resetPasswordToken: { type: String },
    accessToken: { type: String },
    emailVerificationToken: { type: String },
    isVerified: { type: Boolean, default: false },
    type: { type: Number, default: 1 }, // 1 = user, 2 = member, 0 = admin panel user
    profileImage: { type: String },
    profileImageLocal: { type: String },
    roleId: { type: String, default: null },
    resetCode: { type: String },
    activePlan: { type: mongoose.Schema.Types.ObjectId },
    isSuperAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Methods
 */

User.method({
  verifyPassword(password) {
    return bcrypt.compareSync(password, this.password);
  },
  transform() {
    const transformed = {};
    const fields = [
      "_id",
      "fullName",
      "email",
      "status",
      "type",
      "accessToken",
    ];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  token() {
    const payload = {
      exp: moment().add(jwtExpirationInterval, "minutes").unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(payload, pwEncryptionKey);
  },
});

User.methods.getPasswordHash = async function (password) {
  const rounds = pwdSaltRounds ? parseInt(pwdSaltRounds) : 10;
  const hash = await bcrypt.hash(password, rounds);
  return hash;
};

User.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();
    const rounds = pwdSaltRounds ? parseInt(pwdSaltRounds) : 10;
    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * @typedef User
 */

module.exports = mongoose.model("User", User);
