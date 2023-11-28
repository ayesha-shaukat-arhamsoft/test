const fs = require("fs");
const ObjectId = require("mongoose").Types.ObjectId;
const BlogPosts = require("../../models/blog-post.model");
const { checkDuplicate } = require("../../utils/error");
const { uploadToCloudinary } = require("../../utils/upload");
const moment = require("moment");
const { baseUrl, defaultPlaceholderImage } = require("../../../config/var");

// API to create Blog Post
exports.create = async (req, res, next) => {
  try {
    const { body: { payload }, files } = req;

    if (!payload.title)
      return res
        .status(400)
        .send({ success: false, message: "Title is required!" });

    if (!payload.content)
      return res
        .status(400)
        .send({ success: false, message: "Conetnt is quired!" });

    if (!payload.blogId)
      return res
        .status(400)
        .send({ success: false, message: "Blog Idy is required!" });

    if (!payload.author)
      return res
        .status(400)
        .send({ success: false, message: "Author is required!" });

    if (files?.featuredImage?.length) {
      const featuredImage = files.featuredImage[0];
      payload.featuredImage = await uploadToCloudinary(featuredImage.path);
      payload.featuredImageLocal = featuredImage.filename;
    } else
      return res
        .status(400)
        .send({ success: false, message: "Featured Image is required" });

    const author = JSON.parse(payload.author);
    payload.authorId = author._id;
    payload.tags = JSON.parse(payload.tags);

    const blogPost = await BlogPosts.create(payload);

    return res.send({
      success: true,
      message: "Blog Post created successfully",
      blogPost,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "BlogPosts");
    else return next(error);
  }
};

// API to edit Blog Post
exports.edit = async (req, res, next) => {
  try {
    const { body: { payload }, files } = req;

    if (!payload.title)
      return res
        .status(400)
        .send({ success: false, message: "Title is required!" });

    if (!payload.content)
      return res
        .status(400)
        .send({ success: false, message: "Content is quired!" });

    if (!payload.blogId)
      return res
        .status(400)
        .send({ success: false, message: "Blog Idy is required!" });

    if (!payload.featuredImage && !req.files.featuredImage)
      return res
        .status(400)
        .send({ success: false, message: "Featured Image is required!" });

    if (!payload.author)
      return res
        .status(400)
        .send({ success: false, message: "Author is required!" });

    if (payload.published) payload.publishDate = moment(new Date());

    if (files?.featuredImage?.length) {
      const featuredImage = files.featuredImage[0];
      payload.featuredImage = await uploadToCloudinary(featuredImage.path);
      payload.featuredImageLocal = featuredImage.filename;
    }

    const author = JSON.parse(payload.author);
    payload.authorId = author._id;
    payload.tags = JSON.parse(payload.tags);

    const blogPost = await BlogPosts.findByIdAndUpdate(
      { _id: ObjectId(payload._id) },
      { $set: payload },
      { new: true }
    );

    return res.send({
      success: true,
      message: "Blog Post updated successfully",
      blogPost,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "BlogPosts");
    else return next(error);
  }
};

// API to delete Blog Post
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id) {
      const blogPost = await BlogPosts.deleteOne({ _id: ObjectId(id) });
      if (blogPost)
        return res.send({
          success: true,
          message: "Blog Post deleted successfully",
        });
      else
        return res.status(400).send({
          success: false,
          message: "Blog Post not found for given Id",
        });
    } else
      return res
        .status(400)
        .send({ success: false, message: "Blog Post Id is required" });
  } catch (error) {
    return next(error);
  }
};

// API to get a Blog Post
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;

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
            author: {
              fullName: "$author.fullName",
              _id: "$author._id",
            },
            featuredImage: {
              $ifNull: [
                { $concat: [baseUrl, "$featuredImageLocal"] },
                defaultPlaceholderImage,
              ],
            },
          },
        },
      ]);

      if (blogPost)
        return res.status(200).send({
          success: true,
          message: "Blog Post retrieved successfully",
          blogPost,
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
    const {
      title,
      blogId,
      authorId,
      tag,
      published,
    } = req.query;
    let {
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};

    page = Number(page);
    limit = Number(limit);

    if (blogId) {
      filter.blogId = ObjectId(blogId);
    }

    if (authorId) filter.authorId = ObjectId(authorId);

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (tag) {
      filter.tags = { $elemMatch: { $regex: tag, $options: "i" } };
    }

    if (published) {
      filter.published = published == "true" ? true : false;
    }

    const total = await BlogPosts.countDocuments(filter);

    if (page > Math.ceil(total / limit) && total > 0)
      page = Math.ceil(total / limit);

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
          tags: 1,
          content: 1,
          title: 1,
          published: 1,
          publishDate: 1,
          author: {
            fullName: "$author.fullName",
            _id: "$author._id",
          },
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
      { $skip: limit * (page - 1) },
      { $limit: limit },
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
    const { file: imageData } = req;
    if (imageData) {
      return res.status(200).send({
        success: true,
        message: "Image uploaded successfully!",
        imageData
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
