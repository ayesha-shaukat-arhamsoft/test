const fs = require("fs");
const ObjectId = require("mongoose").Types.ObjectId;
const BlogCategories = require("../../models/blog-category.model");
const { checkDuplicate } = require("../../utils/error");

// API to get a Blog Category
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id) {
      const blogCategory = await BlogCategories.findOne(
        { _id: ObjectId(id) },
        { _id: 1, category: 1, description: 1, status: 1 }
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
    const { query } = req;
    const { all, status, category } = query;
    let { page = 1, limit = 10 } = query;
    const filter = {};

    page = Number(page);
    limit = Number(limit);

    if (category) {
      filter.category = { $regex: category };
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
      {
        $lookup: {
          from: "blogs",
          foreignField: "categoryId",
          localField: "_id",
          as: "blogs",
        },
      },
      ...pipeline,
      {
        $project: {
          _id: 1,
          category: 1,
          status: 1,
          description: 1,
          blogsLength: { $size: "$blogs" },
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

exports.highlighted = async (req, res, next) => {
  try {
    const filter = {
      status: true,
      isHighlighted: true
    };

    const categories = await BlogCategories.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "blogs",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$categoryId", "$$id"] },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 3 },
            {
              $project: {
                _id: 1,
                title: 1,
                featuredImage: 1,
                createdAt: 1,
              },
            },
          ],
          as: "blogs",
        },
      },
      { $limit: 1 },
      {
        $project: {
          _id: 1,
          category: 1,
          blog: "$blogs",
        },
      },
    ]);

    return res.send({
      success: true,
      message: "Blog Highlighted Category Fetched Successfully",
      data: {
        categories,
      },
    });
  } catch (error) {
    return next(error);
  }
};
