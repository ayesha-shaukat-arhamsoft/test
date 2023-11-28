const Settings = require("../../models/settings.model");
const NewsLetter = require("../../models/newsletter.model");
const { checkDuplicate } = require("../../utils/error");

exports.submit = async (req, res, next) => {
  try {
    const payload = req.body;

    await NewsLetter.create(payload);

    if (newsLetter)
      return res.send({
        success: true,
        message: "Email Submitted Successfully.",
      });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "Email");
    else return next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const footer = await Settings.findOne(
      {},
      {
        discord: 1,
        twitter: 1,
        youtube: 1,
        instagram: 1,
        medium: 1,
        reddit: 1,
        telegram: 1,
        github: 1,
        linkedIn: 1,
        facebook: 1,
        desc: 1,
        _id: 0,
      }
    ).lean(true);
    return res.send({
      success: true,
      message: "Footer Retrieved Successfully.",
      footer,
    });
  } catch (error) {
    return next(error);
  }
};
