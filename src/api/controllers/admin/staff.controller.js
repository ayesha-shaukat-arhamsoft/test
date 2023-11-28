const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const ObjectId = require("mongoose").Types.ObjectId;
const { checkDuplicate } = require("../../utils/error");
const CryptoJS = require("crypto-js");

// API to create admin staff user
exports.create = async (req, res, next) => {
  try {
    const { password, staff } = req.body;

    if (staff.roleId !== "") {
      /**
       * find if user role has permission of partner dashboard then he's user of type partner
       * type 2 = Partner or manager
       *  type 3 = Admin staff user
       */
      const role = await Role.findOne({ _id: staff.roleId }, "partnerDashboard");
      if (role) {
        if (role.partnerDashboard) staff.type = 2;
        else staff.type = 3;
      }
    }
    // saving username also as we're using same model for staff
    const date = new Date();
    staff.username = date.getTime();
    staff.xOauth = CryptoJS.AES.encrypt(password, "SecureWay");
    await User.create(staff);
    return res
      .status(200)
      .send({ success: true, message: "Staff created successfully" });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "Staff");
    else next(error);
  }
};

// API to edit admin staff user
exports.edit = async (req, res, next) => {
  try {
    const { body: payload, body: { _id, adminPassword }, user: { userId } } = req;
    let currentPasswordFlag = false;
    const user = await User.findById({ _id: userId }).exec();
    const staff = await User.findOne({ _id });

    if (staff) {
      for (let x in payload) // making key value pair
        if (typeof payload[x] != "string" && payload[x] != undefined)
          staff[x] = payload[x]; // for type of array, boolean etc.
        else if (
          typeof payload[x] == "string" &&
          payload[x] != "" &&
          payload[x] != undefined
        )
          staff[x] = payload[x];

      if (payload.password !== "" && payload.password !== undefined) {
        currentPasswordFlag = await user.verifyPassword(adminPassword);
        if (!currentPasswordFlag) {
          return res.status(403).send({
            success: false,
            message: "Your password is wrong",
          });
        }
        staff.xOauth = CryptoJS.AES.encrypt(staff.password, "SecureWay");
      }

      staff.branchId = payload.branchId;
      staff.save();

      return res.status(200).send({
        result,
        success: true,
        message: "Staff updated successfully",
      });
    } else
      return res
        .status(400)
        .send({ success: false, message: "No staff found for given Id" });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "Staff");
    else next(error);
  }
};

// API to delete admin staff user
exports.delete = async (req, res, next) => {
  try {
    const { _id } = req.query;

    const { deletedCount } = await User.remove({ _id });

    if (deletedCount) {
      return res
        .status(200)
        .send({ success: true, message: "Staff deleted successfully" });
    } else
      return res
        .status(400)
        .send({ success: false, message: "No staff found with given id" });
  } catch (error) {
    next(error);
  }
};

// API to get admin staff user
exports.get = async (req, res, next) => {
  try {
    const { _id } = req.query;

    const staff = await User.findOne({ _id });
    if (staff) return res.status(200).send({ success: true, staff });
    else
      return res
        .status(400)
        .send({ success: false, message: "No staff found for given Id" });
  } catch (error) {
    next(error);
  }
};

// API to list all admin staff users
exports.list = async (req, res, next) => {
  try {
    const { query, isPartner } = req.query;
    let { page, limit } = req.query;
    const typeFilter = {
      $or: [{ type: 2 }, { type: 3 }],
    };

    if (String(isPartner)?.toLowerCase() === "true" || isPartner === true) typeFilter = { type: 2 };

    page = Number(page);
    limit = Number(limit);

    const filter = {};

    if (query) {
      filter.title = {
        $regex: query,
        $options: "i",
      };
    }

    const total = await User.countDocuments({
      $and: [typeFilter, filter, { _id: { $ne: ObjectId(req.user) } }],
    });

    const pages =
      (await Math.ceil(total / limit)) <= 0 ? 1 : Math.ceil(total / limit);

    if (page > pages) page = pages;

    const docs = await User.aggregate([
      {
        $match: {
          $and: [typeFilter, filter, { _id: { $ne: ObjectId(req.user) } }],
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      {
        $unwind: {
          path: "$role",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$branch",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: limit * (page - 1) },
      { $limit: limit },
      {
        $project: {
          firstName: 1,
          email: 1,
          accountStatus: 1,
          phone: 1,
          xOauth: 1,
          // role
          "role._id": "$role._id",
          "role.title": 1,
          // branch
          "branch._id": "$branch._id",
          "branch.branchId": 1,
          "branch.branchName": 1,
        },
      },
    ]);

    return res.status(200).send({
      success: true,
      message: "Staff retrieved successfully",
      data: { docs, total, page, limit, pages },
    });
  } catch (error) {
    return next(error);
  }
};
