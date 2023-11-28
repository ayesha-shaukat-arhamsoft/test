const Notification = require("../../models/notification.model");
const ObjectId = require("mongoose").Types.ObjectId;

exports.list = async (req, res, next) => {
  try {
    const { userId, hasSeen, all } = req.query;
    let { page = 1, limit = 10 } = req.query;

    if (!userId)
      return res
        .status(400)
        .send({ success: false, message: "User Id is required!" });

    const filter = {
      notificationTo: ObjectId(userId)
    };

    if (String(hasSeen) === "2" && String(all)?.toLowerCase() == "true") {
      filter.hasSeen = false;
      const total = await Notification.countDocuments(filter);
      return res.status(200).send({ success: true, total });
    }

    page = Number(page);
    limit = Number(limit);

    const userNotifications = await Notification.aggregate([
      {
        $match: filter,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          type: 1,
          hasSeen: 1,
          createdAt: 1,
        },
      },
      { $skip: limit * (page - 1) },
      { $limit: limit },
    ]);

    return res.status(200).send({
      success: true,
      message: "User Notifications fetched successfully!",
      userNotifications,
    });
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      { notificationTo: ObjectId(userId), hasSeen: false },
      { $set: { hasSeen: true } },
    );

    return res.status(200).send({
      success: true,
      message: "Notifications status updated successfully!",
    });
  } catch (err) {
    next(err);
  }
};
