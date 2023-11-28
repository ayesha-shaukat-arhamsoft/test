const fs = require("fs");
const ObjectId = require("mongoose").Types.ObjectId;
const BlogCategories = require("../../models/blog-category.model");
const { checkDuplicate } = require("../../utils/error");

// API to create Blog Category
exports.create = async (req, res, next) => {
  try {
    const payload = req.body;

    if (!payload.category)
      return res
        .status(400)
        .send({ success: false, message: "Category Title is required!" });

    const blogCategory = await BlogCategories.create(payload);

    return res.send({
      success: true,
      message: "Blog Category created successfully",
      blogCategory,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "BlogCategories");
    else return next(error);
  }
};

// API to edit Blog Category
exports.edit = async (req, res, next) => {
  try {
    const payload = req.body;

    const blogCategory = await BlogCategories.findByIdAndUpdate(
      { _id: ObjectId(payload._id) },
      { $set: payload },
      { new: true }
    );

    return res.send({
      success: true,
      message: "Blog Category updated successfully",
      blogCategory,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "BlogCategories");
    else return next(error);
  }
};

// API to delete Blog Category
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id) {
      const blogCategory = await BlogCategories.deleteOne({
        _id: ObjectId(id),
      });
      if (blogCategory)
        return res.send({
          success: true,
          message: "Blog Category deleted successfully",
        });
      else
        return res.status(400).send({
          success: false,
          message: "Blog Category not found for given Id",
        });
    } else
      return res
        .status(400)
        .send({ success: false, message: "Blog Category Id is required" });
  } catch (error) {
    return next(error);
  }
};

// API to get a Blog Category
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id) {
      const blogCategory = await BlogCategories.findOne(
        { _id: ObjectId(id) },
        { _id: 1, category: 1, description: 1, status: 1, isHighlighted: 1 }
      ).lean(true);
      if (blogCategory)
        return res.status(200).send({
          success: true,
          message: "Blog Category retrieved successfully",
          blogCategory,
        });

      return res.status(400).send({
        success: false,
        message: "Blog Category not found for given Id",
      });
    } else
      return res
        .status(400)
        .send({ success: false, message: "Blog Category Id is required" });
  } catch (error) {
    return next(error);
  }
};

// API to get Blog Category list
exports.list = async (req, res, next) => {
  try {
    const { all, status, category } = req.query;
    let { page = 1, limit = 10 } = req.query;
    const filter = {};

    page = Numbe(page);
    limit = Numbe(limit);

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    if (status) {
      if (String(status)?.toLowerCase() === "true") {
        filter.status = true;
      } else if (String(status)?.toLowerCase() === "false") {
        filter.status = false;
      }
    }

    const total = await BlogCategories.countDocuments(filter);

    if (page > Math.ceil(total / limit) && total > 0)
      page = Math.ceil(total / limit);

    let pipeline = [];

    if (!all) pipeline = [{ $skip: limit * (page - 1) }, { $limit: limit }];

    if (all) filter.status = true;

    const categories = await BlogCategories.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      ...pipeline,
      {
        $project: {
          _id: 1,
          category: 1,
          status: 1,
          description: 1,
        },
      },
    ]);

    return res.send({
      success: true,
      message: "Blog Categories Fetched Successfully",
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};
