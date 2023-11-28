const Notification = require("../../models/notification.model");

exports.list = async (req, res, next) => {
  try {
    const { hasSeen, all } = req.query;
    let { page = 1, limit = 10 } = req.query;

    const filter = {
      adminNotification: true,
    };

    if (String(hasSeen) === "2" && String(all)?.toLowerCase() == "true") {
      filter.hasSeen = false;
      const total = await Notification.countDocuments(filter);
      return res.status(200).send({ success: true, total });
    }

    page = Number(page);
    limit = Number(limit);

    const adminNotifications = await Notification.aggregate([
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
      message: "Admin Notifications fetched successfully!",
      adminNotifications,
    });
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { adminNotification: true, hasSeen: false },
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
