const Settings = require("../../models/settings.model");
const { checkDuplicate } = require("../../utils/error");

// API to edit Settings
exports.edit = async (req, res, next) => {
  try {
    const { body: { lat, lng }, body: payload } = req;

    if (lat && lng)
      payload.location = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };

    const settings = await Settings.updateOne(
      {},
      { $set: payload },
      { upsert: true }
    );
    return res.send({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "Settings");
    else return next(error);
  }
};

// API to get Settings
exports.get = async (req, res, next) => {
  try {
    const settings = await Settings.findOne(
      {},
      {
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
        stripeProductKeys: 0,
        webhookSecret: 0,
      }
    ).lean(true);

    return res.json({
      success: true,
      message: "Settings retrieved successfully",
      settings,
    });
  } catch (error) {
    return next(error);
  }
};
