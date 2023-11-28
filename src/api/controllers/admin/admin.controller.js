const fs = require("fs");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const { uploadToCloudinary } = require("../../utils/upload");
const { checkDuplicate } = require("../../utils/error");
const { sendEmail } = require("../../utils/emails/email");
const {
  baseUrl,
  adminPasswordKey,
  privateAdminPermissionsKeys,
} = require("../../../config/var");
const randomstring = require("randomstring");
const { validationResult } = require("express-validator");
const Users = require("../../models/user.model");
const FAQ = require("../../models/faq.model");

const { uploadedImgPath } = require("../../../config/var");
const ObjectId = require("mongoose").Types.ObjectId;
const {
  pwdSaltRounds,
  jwtExpirationInterval,
  pwEncryptionKey,
  createAdminReqUrl,
} = require("../../../config/var");
const bcrypt = require("bcryptjs");

// API to login admin
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase();
    const user = await User.findOne({
      email: email,
      roleId: { $ne: null },
    }).lean();

    if (!user)
      return res
        .status(400)
        .send({ success: false, message: "Incorrect email or password" });

    if (!user.roleId)
      return res
        .status(400)
        .send({ success: false, message: "No role exist against this admin" });

    const adminRoles = await Role.findOne({ _id: user.roleId }, { status: 1 });

    passport.use(
      new localStrategy(
        { usernameField: "email" },
        (username, password, done) => {
          User.findOne(
            { email: username },
            "name email phone roleId status image password",
            (err, user) => {
              if (err) return done(err);
              else if (!user)
                // unregistered email
                return done(null, false, {
                  success: false,
                  message: "Incorrect email or password",
                });
              else if (!user.verifyPassword(password))
                // wrong password
                return done(null, false, {
                  success: false,
                  message: "Incorrect email or password",
                });
              else return done(null, user);
            }
          );
        }
      )
    );

    // call for passport authentication
    passport.authenticate("local", async (err, user, info) => {
      if (err)
        return res.status(400).send({
          err,
          success: false,
          message: "Oops! Something went wrong while authenticating",
        });
      // registered user
      else if (user) {
        if (!user.status)
          return res.status(403).send({
            success: false,
            message: "Your account is inactive, kindly contact admin",
            user,
          });
        else {
          const accessToken = await user.token();
          let data = {
            ...user._doc,
            accessToken,
          };
          await User.updateOne(
            { _id: user._id },
            { $set: { accessToken } },
            { upsert: true }
          );
          return res.status(200).send({
            success: true,
            message: "User logged in successfully",
            data,
            adminStatus: adminRoles?.status,
          });
        }
      }
      // unknown user or wrong password
      else
        return res
          .status(402)
          .send({ success: false, message: "Incorrect email or password" });
    })(req, res);
  } catch (error) {
    return next(error);
  }
};

// API to create admin
exports.create = async (req, res, next) => {
  try {
    let payload = req.body;
    if (req.files && req.files.image) {
      const image = req.files.image[0];
      // const imgData = fs.readFileSync(image.path)
      payload.image = await uploadToCloudinary(image.path);
    }

    payload.type = 0;
    const admin = new User(payload);
    await admin.save();

    // const admin = await User.create(payload)
    return res.send({
      success: true,
      message: "User user created successfully",
      admin,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "User");
    else return next(error);
  }
};

//API to verify  admin password
exports.verify = async (req, res, next) => {
  try {
    let { password } = req.body;
    let userId = req.user;
    let currentPasswordFlag = false;
    let user = await User.findById({ _id: userId }).exec();
    if (user) {
      if (password) {
        currentPasswordFlag = await user.verifyPassword(password); // check if current password is valid
      }
      if (currentPasswordFlag) {
        return res.status(200).send({
          success: true,
          message: "Password is right",
          data: true,
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "Your entered password is wrong",
          data: false,
        });
      }
    }
  } catch (error) {
    return next(error);
  }
};
// API to edit admin
exports.edit = async (req, res, next) => {
  try {
    let payload = req.body;
    if (req.files && req.files.profileImage) {
      const image = req.files.profileImage[0];
      // const imgData = fs.readFileSync(image.path)
      payload.profileImage = await uploadToCloudinary(image.path);
      payload.profileImageLocal = image.filename;
    }

    if (req.body.roleId) {
      req.body.roleId = ObjectId(`${req.body.roleId}`);
    }

    if (req.body.password) {
      const rounds = pwdSaltRounds ? parseInt(pwdSaltRounds) : 10;
      const hash = await bcrypt.hash(req.body.password, rounds);
      req.body.password = hash;
    }
    const admin = await User.findByIdAndUpdate(
      { _id: ObjectId(payload._id) },
      { $set: payload },
      { new: true }
    );

    return res.send({
      success: true,
      message: "User updated successfully",
      admin,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "User");
    else return next(error);
  }
};

// API to delete admin
exports.delete = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    if (adminId) {
      const admin = await User.deleteOne({ _id: adminId });
      if (admin.deletedCount)
        return res.send({
          success: true,
          message: "User deleted successfully",
          adminId,
        });
      else
        return res
          .status(400)
          .send({ success: false, message: "User not found for given Id" });
    } else
      return res
        .status(400)
        .send({ success: false, message: "User Id is required" });
  } catch (error) {
    return next(error);
  }
};

// API to get an admin
exports.get = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    if (adminId) {
      let admin = await User.findOne(
        { _id: ObjectId(adminId) },
        { __v: 0, createdAt: 0, updatedAt: 0, password: 0 }
      ).lean(true);
      if (admin) {
        admin.image = admin?.profileImageLocal
          ? `${uploadedImgPath}${admin.profileImageLocal}`
          : "";
        return res.json({
          success: true,
          message: "User retrieved successfully",
          admin,
        });
      } else
        return res
          .status(400)
          .send({ success: false, message: "User not found for given Id" });
    } else
      return res
        .status(400)
        .send({ success: false, message: "User Id is required" });
  } catch (error) {
    return next(error);
  }
};

// API to get admin list
exports.list = async (req, res, next) => {
  try {
    const { adminId, title, email, status, roleId, all } = req.query;
    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    const filter = {
      roleId: { $ne: null },
      type: 0
    };

    if (title) filter.fullName = { $regex: title, $options: "i" };

    if (email) filter.email = email.toLowerCase().trim();

    if (status) {
      if (String(status)?.toLowerCase() === "true") {
        filter.status = true;
      } else if (String(status)?.toLowerCase() === "false") {
        filter.status = false;
      }
    }

    if (roleId) {
      filter.roleId = roleId;
    }

    let pipeline = [];
    if (!all) pipeline = [{ $skip: limit * (page - 1) }, { $limit: limit }];
    let total = 0;
    total = await User.countDocuments({ ...filter });

    const admins = await User.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      ...pipeline,
      { $addFields: { role_Id: { $toObjectId: "$roleId" } } },
      {
        $lookup: {
          from: "roles",
          foreignField: "_id",
          localField: "role_Id",
          as: "role",
        },
      },
      { $unwind: "$role" },
      {
        $project: {
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
    ]);

    return res.send({
      success: true,
      message: "Users fetched successfully",
      data: {
        admins,
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

// API to edit admin password
exports.editPassword = async (req, res, next) => {
  try {
    const payload = req.body;
    const admin = await User.find({ _id: ObjectId(payload._id) });

    if (payload.new === payload.current)
      return res.send({
        success: false,
        message: "New password should not be same as current password!",
      });

    if (admin[0].verifyPassword(payload.current)) {
      let newPayload = {
        password: await admin[0].getPasswordHash(payload.new),
      };
      let updatedUser = await User.findByIdAndUpdate(
        { _id: ObjectId(payload._id) },
        { $set: newPayload },
        { new: true }
      );
      return res.send({
        success: true,
        message: "Password updated successfully! Please log-in again.",
        updatedUser,
      });
    } else {
      return res.send({
        success: false,
        message: "Incorrent current password",
        admin: admin[0],
      });
    }
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "User");
    else return next(error);
  }
};

// API to edit admin password
exports.forgotPassword = async (req, res, next) => {
  try {
    const payload = req.body;
    const admin = await User.find({
      email: payload.email,
      roleId: { $ne: null },
    });
    if (admin.length) {
      const randString = randomstring.generate({
        length: 8,
        charset: "alphanumeric",
      });
      await User.findByIdAndUpdate(
        { _id: ObjectId(admin[0]._id) },
        { $set: { resetCode: randString } },
        { new: true }
      );

      const content = {
        "${url}": `${baseUrl}admin/reset-password/${admin[0]._id}/${randString}`,
      };

      await sendEmail(payload.email, "forgot-password", content);
      return res.send({
        success: true,
        message:
          "An email has been sent to your account in case an account with this email exists. Please check your email and follow the instruction in it to reset your password.",
      });
    } else {
      return res.send({
        success: true,
        message:
          "An email has been sent to your account in case an account with this email exists. Please check your email and follow the instruction in it to reset your password.",
      });
    }
  } catch (error) {
    return next(error);
  }
};

// API to reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const payload = req.body;
    const admin = await User.find({ _id: ObjectId(payload._id) });
    if (admin.length) {
      if (admin[0].resetCode === payload.code) {
        let newPayload = {
          password: await admin[0].getPasswordHash(payload.new),
          resetCode: "",
        };
        let updatedUser = await User.findByIdAndUpdate(
          { _id: ObjectId(payload._id) },
          { $set: newPayload },
          { new: true }
        );
        return res.send({
          success: true,
          message: "Password reset successfully",
          updatedUser,
        });
      } else {
        return res.send({
          success: false,
          message: "Session expired, try again with other email link.",
        });
      }
    } else {
      return res.send({ success: false, message: "Incorrent User Id" });
    }
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "User");
    else return next(error);
  }
};

// API to get dashboard
exports.dashboard = async (req, res, next) => {
  try {
    const users = await Users.countDocuments({ roleId: null });
    const faqs = await FAQ.countDocuments({});

    return res.send({
      success: true,
      message: "Stats fetched successfully",
      data: {
        users,
        faqs,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.privateAdmin = async (req, res, next) => {
  try {
    return res.render("index", { createAdminReqUrl });
  } catch (err) {
    next(err);
  }
};

exports.createPrivateAdmin = async (req, res, next) => {
  try {
    const { name, email, password, privateKey, status: adminStatus } = req.body;

    const status = String(adminStatus)?.toLowerCase() === "1" ? true : false;
    const admin = await User.findOne({ email }, { _id: 1, email: 1 });

    if (admin) {
      return res.status(400).send({
        status: false,
        message: "Admin with same email already exists!",
      });
    }

    if (privateKey === adminPasswordKey) {
      const payload = { fullName: name, email, password, status, type: 0 };
      const role = await Role.findOne({ superAdminRole: true }, { _id: 1 });

      if (role) {
        payload.roleId = new ObjectId(role._id);
      } else {
        role = await Role.create(privateAdminPermissionsKeys);
        payload.roleId = new ObjectId(role._id);
      }

      const superAdmin = await User.findOne({ isSuperAdmin: true });
      if (!superAdmin) {
        payload.isSuperAdmin = true;
      }

      await User.create(payload);
      return res
        .status(200)
        .send({ status: true, message: "Super admin created successfully!" });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Incorrect private key!" });
    }
  } catch (err) {
    next(err);
  }
};

exports.imageUpload = async (req, res, next) => {
  try {
    const { filename: image = "" } = req.file;
    return res.json({
      success: true,
      message: "Image upload successfully",
      data: image,
    });
  } catch (error) {
    return res.status(400).send({ success: false, message: error });
  }
};

exports.uploadContent = async (req, res, next) => {
  try {
    const { filename: files = "" } = req.file;
    return res.json({
      success: true,
      message: "File upload successfully",
      data: files,
    });
  } catch (error) {
    return res.status(400).send({ success: false, message: error });
  }
};
