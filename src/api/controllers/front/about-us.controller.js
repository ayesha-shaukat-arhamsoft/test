const User = require("../../models/user.model");

// API to get about us stats
exports.stats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();

    return res.status(200).send({
      success: true,
      message: "Stats fetched successfully",
      data: {
        totalUsers,
      },
    });
  } catch (error) {
    return next(error);
  }
};
