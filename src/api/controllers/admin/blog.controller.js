const fs = require("fs");
const ObjectId = require("mongoose").Types.ObjectId;
const Blogs = require("../../models/blog.model");
const { checkDuplicate } = require("../../utils/error");
const { uploadToCloudinary } = require("../../utils/upload");
const { baseUrl, defaultPlaceholderImage } = require("../../../config/var");

// API to create Blog
exports.create = async (req, res, next) => {
  try {
    const { body: { payload }, files } = req;

    if (!payload.title)
      return res
        .status(400)
        .send({ success: false, message: "Blog Title is required!" });

    if (!payload.categoryId)
      return res
        .status(400)
        .send({ success: false, message: "Blog Category is required!" });

    if (files?.featuredImage?.length) {
      const featuredImage = files.featuredImage[0];
      payload.featuredImage = await uploadToCloudinary(featuredImage.path);
      payload.featuredImageLocal = featuredImage.filename;
    } else
      return res
        .status(400)
        .send({ success: false, message: "Featured Image is required" });

    const blog = await Blogs.create(payload);

    return res.send({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "Blogs");
    else return next(error);
  }
};

// API to edit Blog
exports.edit = async (req, res, next) => {
  try {
    const { body: { payload }, files } = req;

    if (!payload.title)
      return res
        .status(400)
        .send({ success: false, message: "Blog Title is required!" });

    if (!payload.categoryId)
      return res
        .status(400)
        .send({ success: false, message: "Blog Category is required!" });

    if (!payload.featuredImage && !req.files.featuredImage)
      return res
        .status(400)
        .send({ success: false, message: "Featured Image is required!" });

    if (files?.featuredImage?.length) {
      const featuredImage = files.featuredImage[0];
      payload.featuredImage = await uploadToCloudinary(featuredImage.path);
      payload.featuredImageLocal = featuredImage.filename;
    }

    const blog = await Blogs.findByIdAndUpdate(
      { _id: ObjectId(payload._id) },
      { $set: payload },
      { new: true }
    );

    return res.send({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "Blogs");
    else return next(error);
  }
};

// API to delete Blog
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id) {
      const blog = await Blogs.deleteOne({ _id: ObjectId(id) });
      if (blog)
        return res.send({
          success: true,
          message: "Blog deleted successfully",
        });
      else
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

// API to get a Blog
exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id) {
      const blog = await Blogs.findOne(
        { _id: ObjectId(id) },
        {
          _id: 1,
          title: 1,
          categoryId: 1,
          description: 1,
          featuredImageLocal: 1,
          isFeatured: 1,
        }
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
    const { title, categoryId, all } = req.query;
    let { page = 1, limit = 10 } = req.query;
    const filter = {};

    page = Number(page);
    limit = Number(limit);

    if (categoryId) {
      filter.categoryId = ObjectId(categoryId);
    }

    if (title) {
      filter.title = {
        $regex: title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
      };
    }

    const total = await Blogs.countDocuments(filter);

    if (page > Math.ceil(total / limit) && total > 0)
      page = Math.ceil(total / limit);

    let pipeline = [];

    if (!all) pipeline = [{ $skip: limit * (page - 1) }, { $limit: limit }];

    const blogs = await Blogs.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "blogcategories",
          foreignField: "_id",
          localField: "categoryId",
          as: "blogCategory",
        },
      },
      { $unwind: { path: "$blogCategory", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          categoryId: 1,
          description: 1,
          featuredImage: {
            $ifNull: [
              { $concat: [baseUrl, "$featuredImageLocal"] },
              defaultPlaceholderImage,
            ],
          },
          blogCategory: {
            _id: "$blogCategory._id",
            name: "$blogCategory.category",
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
