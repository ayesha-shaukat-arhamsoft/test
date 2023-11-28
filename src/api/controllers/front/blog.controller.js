const fs = require("fs");
const ObjectId = require("mongoose").Types.ObjectId;
const Blogs = require("../../models/blog.model");
const { baseUrl, defaultPlaceholderImage } = require("../../../config/var");

// API to get a Blog
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id) {
      if (!ObjectId.isValid(blogId))
        return res.status(400).send({
          success: false,
          message: "Invalid Blog Post Id",
          invalidBlog: true,
        });

      const blog = await Blogs.findOne(
        { _id: ObjectId(id) },
        {
          _id: 1,
          title: 1,
          categoryId: 1,
          description: 1,
          featuredImageLocal: 1,
        },
      ).lean(true);

      if (blog) {
        blog.featuredImage = blog.featuredImageLocal
          ? `${baseUrl}${blog.featuredImageLocal}`
          : defaultPlaceholderImage;
        return res.status(200).send({
          success: true,
          message: "Blog retrieved successfully",
          blog,
        });
      }

      return res
        .status(400)
        .send({ success: false, message: "Blog not found for given Id" });
    } else
      return res
        .status(400)
        .send({ success: false, message: "Blog Id is required" });
  } catch (error) {
    return next(error);
  }
};

// API to get Blog list
exports.list = async (req, res, next) => {
  try {
    const { query } = req;
    const { blogId, all } = query;
    let { page = 1, limit = 10 } = query;

    const filter = {};

    if (!ObjectId.isValid(blogId))
      return res.status(400).send({
        success: false,
        message: "Invalid Blog Post Id",
        invalidBlog: true,
      });

    page = Number(page);
    limit = Number(limit);

    const blog = await Blogs.findById(blogId, "categoryId");

    if (blog && blog.categoryId) filter.categoryId = ObjectId(blog.categoryId);

    const total = await Blogs.countDocuments(filter);

    if (page > Math.ceil(total / limit) && total > 0)
      page = Math.ceil(total / limit);

    let pipeline = [];

    if (!all) pipeline = [{ $skip: limit * (page - 1) }, { $limit: limit }];

    const blogs = await Blogs.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $unwind: { path: "$blogCategory", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          categoryId: 1,
          description: 1,
          createdAt: 1,
          featuredImage: {
            $ifNull: [
              { $concat: [baseUrl, "$featuredImageLocal"] },
              defaultPlaceholderImage,
            ],
          },
        },
      },
      ...pipeline,
    ]);

    return res.send({
      success: true,
      message: "Blogs Fetched Successfully",
      data: {
        blogs,
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

// API to get Blog list
exports.getlatest = async (req, res, next) => {
  try {
    const blog = await Blogs.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "blogcategories",
          let: { categoryId: "$categoryId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$categoryId", "$_id"] },
                    { $eq: ["$status", true] },
                  ],
                },
              },
            },
          ],
          as: "blogCategory",
        },
      },
      { $unwind: "$blogCategory" },
      {
        $project: {
          _id: 1,
          title: 1,
          categoryId: 1,
          createdAt: 1,
          featuredImage: {
            $ifNull: [
              { $concat: [baseUrl, "$featuredImageLocal"] },
              defaultPlaceholderImage,
            ],
          },
        },
      },
      { $limit: 1 },
    ]);
    return res.send({
      success: true,
      message: "Blogs Fetched Successfully",
      data: {
        blog,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getfeatured = async (req, res, next) => {
  try {
    const blog = await Blogs.aggregate([
      { $match: { isFeatured: true } },
      {
        $lookup: {
          from: "blogcategories",
          let: { categoryId: "$categoryId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$categoryId", "$_id"] },
                    { $eq: ["$status", true] },
                  ],
                },
              },
            },
          ],
          as: "blogCategory",
        },
      },
      { $unwind: "$blogCategory" },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          title: 1,
          categoryId: 1,
          createdAt: 1,
          featuredImage: {
            $ifNull: [
              { $concat: [baseUrl, "$featuredImageLocal"] },
              defaultPlaceholderImage,
            ],
          },
        },
      },
    ]);
    return res.send({
      success: true,
      message: "Blogs Fetched Successfully",
      data: {
        blog,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// API to get Blog list
exports.explore = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const filter = {};

    if (categoryId) {
      filter.categoryId = ObjectId(categoryId);
    }

    const blogs = await Blogs.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "blogcategories",
          let: { categoryId: "$categoryId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$categoryId", "$_id"] },
                    { $eq: ["$status", true] },
                  ],
                },
              },
            },
          ],
          as: "blogCategory",
        },
      },
      { $unwind: "$blogCategory" },
      {
        $project: {
          _id: 1,
          title: 1,
          categoryId: 1,
          createdAt: 1,
          featuredImage: {
            $ifNull: [
              { $concat: [baseUrl, "$featuredImageLocal"] },
              defaultPlaceholderImage,
            ],
          },
          category: "$blogCategory.category",
        },
      },
    ]);

    return res.send({
      success: true,
      message: "Blogs Fetched Successfully",
      data: {
        blogs
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.trending = async (req, res, next) => {
  try {
    const blogs = await Blogs.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "blogcategories",
          let: { categoryId: "$categoryId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$categoryId"] },
                    { $eq: ["$status", true] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            {
              $project: {
                _id: 1,
                category: 1,
              },
            },
          ],
          as: "blogcategory",
        },
      },
      {
        $unwind: "$blogcategory",
      },
      {
        $lookup: {
          from: "blogposts",
          let: { id: "$_id", status: "$blogcategory.status" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$blogId", "$$id"] },
                    { $eq: ["$$status", true] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 2 },
            {
              $project: {
                _id: 1,
                title: 1,
                featuredImage: 1,
                createdAt: 1,
              },
            },
          ],
          as: "blogposts",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          featuredImage: 1,
          createdAt: 1,
          description: 1,
          blogcategory: "$blogcategory",
          blogPosts: "$blogposts",
        },
      },
    ]);

    return res.send({
      success: true,
      message: "Blog Highlighted Category Fetched Successfully",
      data: {
        blogs,
      },
    });
  } catch (error) {
    return next(error);
  }
};
