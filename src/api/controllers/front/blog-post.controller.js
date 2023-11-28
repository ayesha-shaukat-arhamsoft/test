const fs = require("fs");
const ObjectId = require("mongoose").Types.ObjectId;
const BlogPosts = require("../../models/blog-post.model");
const { baseUrl, defaultPlaceholderImage } = require("../../../config/var");

// API to get a Blog Post
exports.get = async (req, res, next) => {
  try {
    const { id, incrementReadCount } = req.query;

    if (incrementReadCount) {
      if (!ObjectId.isValid(id))
        return res
          .status(400)
          .send({ success: false, message: "Invalid Blog Post Id" });

      await BlogPosts.findByIdAndUpdate(id, {
        $inc: { readCount: 1 },
        new: true,
      });
    }

    if (id) {
      const blogPost = await BlogPosts.aggregate([
        { $match: { _id: ObjectId(id) } },
        {
          $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "authorId",
            as: "author",
          },
        },
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            content: 1,
            published: 1,
            tags: 1,
            blogId: 1,
            publishDate: 1,
            featuredImage: {
              $ifNull: [
                { $concat: [baseUrl, "$featuredImageLocal"] },
                defaultPlaceholderImage,
              ],
            },
            author: {
              name: "$author.fullName",
            },
          },
        },
      ]);

      if (blogPost?.length)
        return res.status(200).send({
          success: true,
          message: "Blog Post retrieved successfully",
          blogPost: blogPost[0],
        });

      return res.json({
        success: false,
        message: "Blog Post not found for given id",
      });
    } else
      return res
        .status(400)
        .send({ success: false, message: "Blog Post Id is required" });
  } catch (error) {
    return next(error);
  }
};

// API to get Blog Post list
exports.list = async (req, res, next) => {
  try {
    const { query } = req;
    const { blogId, all } = query;
    let { page = 1, limit = 10 } = query;
    const filter = {};

    page = Number(page);
    limit = Number(limit);

    if (blogId) {
      if (!ObjectId.isValid(blogId))
        return res
          .status(400)
          .send({ success: false, message: "Invalid Blog Id" });

      filter.blogId = ObjectId(blogId);
    }

    const total = await BlogPosts.countDocuments(filter);

    if (page > Math.ceil(total / limit) && total > 0)
      page = Math.ceil(total / limit);

    let pipeline = [];

    if (!all) pipeline = [{ $skip: limit * (page - 1) }, { $limit: limit }];

    const blogPosts = await BlogPosts.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "blogs",
          foreignField: "_id",
          localField: "blogId",
          as: "blog",
        },
      },
      { $unwind: { path: "$blog", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          tags: 1,
          content: 1,
          title: 1,
          published: 1,
          publishDate: 1,
          featuredImage: {
            $ifNull: [
              { $concat: [baseUrl, "$featuredImageLocal"] },
              defaultPlaceholderImage,
            ],
          },
          blog: {
            _id: "$blog._id",
            name: "$blog.title",
          },
        },
      },
      ...pipeline,
    ]);

    const popularTags = await BlogPosts.aggregate([
      { $unwind: { path: "$tags", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$tags",
          tag: { $first: "$tags" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    return res.send({
      success: true,
      message: "Blog Posts Fetched Successfully",
      data: {
        blogPosts,
        popularTags,
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

exports.uploadContentPageImg = async (req, res, next) => {
  try {
    const { file } = req;
    if (file) {
      return res.status(200).send({
        success: true,
        message: "Image uploaded successfully!",
        imageData: file,
      });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "Image not found!" });
    }
  } catch (err) {
    next(err);
  }
};
