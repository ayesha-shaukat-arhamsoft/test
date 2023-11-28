const FAQ = require("../../models/faq.model");
const FaqCat = require("../../models/faq-category.model");

// API to get FAQ list
exports.list = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({ status: true }, { title: 1, desc: 1 });

    return res.status(200).send({
      success: true,
      message: "FAQs fetched successfully",
      data: {
        faqs,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// API to get FAQ list
exports.listFaqCategories = async (req, res, next) => {
  try {
    const faqCats = await FaqCat.find({ status: true }, { title: 1 });

    return res.send({
      success: true,
      message: "FAQ Categories fetched successfully",
      faqCats,
    });
  } catch (error) {
    return next(error);
  }
};
