const mongoose = require("mongoose");

const Notification = new mongoose.Schema(
  {
    videoId: { type: mongoose.Schema.Types.ObjectId },
    notificationTo: { type: mongoose.Schema.Types.ObjectId },
    type: { type: Number }, // 1 = video processing , 2 = video processed, 3 = process-failed
    hasSeen: { type: Boolean, default: false },
    adminNotification: { type: Boolean, default: false }, // if a notification is to be shown on admin side
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", Notification);
