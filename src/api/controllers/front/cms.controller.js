const Cms = require("../../models/cms.model");

exports.get = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (slug) {
      const cms = await Cms.findOne(
        { slug, status: true },
        { title: 1, description: 1, _id: 0 },
      ).lean(true);
      return res.send({
        success: true,
        message: "Content retrieved successfully.",
        cms,
      });
    }
    return res.send({ success: false, message: "Slug is required" });
  } catch (error) {
    return next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const cms = await Cms.find(
      { status: true },
      { title: 1, slug: 1, _id: 0 },
    ).sort({ createdAt: -1 });

    return res.send({
      success: true,
      message: "Informative content retrieved successfully.",
      cms,
    });
  } catch (error) {
    return next(error);
  }
};
