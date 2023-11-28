const moment = require("moment");
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const User = require("../../models/user.model");
const { sendEmail } = require("../../utils/emails/email");
const { createChannel } = require("../front/auth.controller");
const { pwdSaltRounds, baseUrl } = require("../../../config/var");

// API to get users list
exports.list = async (req, res, next) => {
  try {
    const { query = { all, fullName, type, startDate, endDate }, body: { email } } = req;
    let { page = 1, limit = 10, } = req.query;

    const filter = {};
    filter.roleId = null;
    if (email) filter.email = email;

    if (fullName) filter.fullName = { $regex: fullName, $options: "i" };

    if (type) filter.type = Number(type);

    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      if (startDate.getTime() == endDate.getTime()) {
        filter.createdAt = { $gte: startDate };
      } else {
        filter["$and"] = [
          { createdAt: { $gte: startDate } },
          { createdAt: { $lte: endDate } },
        ];
      }
    }

    page = Number(page)
    if (!all)
      limit = Number(limit)

    const total = await User.countDocuments(filter);

    if (page > Math.ceil(total / limit) && total > 0)
      page = Math.ceil(total / limit);

    let pipeline = [{ $sort: { createdAt: -1 } }, { $match: filter }];

    if (!all) {
      pipeline.push({ $skip: limit * (page - 1) });
      pipeline.push({ $limit: limit });
    }

    pipeline.push({
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
        dob: 1,
        createdAt: 1,
        status: 1,
        type: 1,
      },
    });

    const users = await User.aggregate(pipeline);

    return res.send({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
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

// API to delete user
exports.delete = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId) {
      const { deletedCount } = await User.deleteOne({ _id: userId });
      if (deletedCount)
        return res.send({
          success: true,
          message: "User deleted successfully",
          userId,
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

// API to delete user
exports.get = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId) {
      const user = await User.findOne(
        { _id: userId },
        "-password -resetPasswordToken",
      );
      if (user)
        return res.send({
          success: true,
          message: "User fetch successfully",
          user,
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

exports.create = async (req, res, next) => {
  try {
    const { fullName, password, dob, type, email } = req.body;

    if (!fullName)
      return res
        .status(400)
        .send({ success: false, message: "Full name is required!" });

    if (!email)
      return res
        .status(400)
        .send({ success: false, message: "Email is required!" });

    if (!password)
      return res
        .status(400)
        .send({ success: false, message: "Password is required!" });

    if (Number(type) === 2 && !dob)
      return res
        .status(400)
        .send({ success: false, message: "Date of Birth is required!" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res
        .status(200)
        .send({ success: false, message: "User already exists" });
    }

    const rndmoken = randomstring.generate({
      length: 16,
      charset: "alphanumeric",
    });

    const userPayload = {
      fullName,
      email,
      password,
      emailVerificationToken: rndmoken,
    };

    if ((type && Number(type) === 2 && dob) || dob) {
      userPayload.dob = moment(new Date(dob));
      userPayload.type = 2; // member
    }

    user = await User.create(userPayload);

    // create channel for member users
    if (user && user.type === 2) {
      await createChannel(user.fullName, user._id);
    }

    await sendEmail(
      email,
      user.type === 1 ? "register-user" : "register-member",
    );

    const encodedEmail = encodeURIComponent(email);
    const content = {
      "${url}": `${baseUrl}v1/front/auth/verify-email?token=${rndmoken}&email=${encodedEmail}`,
      "${fullName}": user.fullName,
    };
    await sendEmail(email, "email-verification", content);

    user = user.transform();

    const users = await User.find(
      {},
      {
        _id: 1,
        fullName: 1,
        email: 1,
        dob: 1,
        createdAt: 1,
        status: 1,
        type: 1,
      },
    ).sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      message:
        "User created successfully! Please ask user to verify their account.",
      users,
    });
  } catch (error) {
    next(error);
  }
};

exports.edit = async (req, res, next) => {
  try {
    const payload = req.body;
    const { _id, password } = payload;
    if (_id) {
      if (password) {
        let user = await User.findById({ _id }, { password: 1 });
        if (user.verifyPassword(password))
          return res.status(400).send({
            success: false,
            message: "Current and New Password should not be same",
          });

        const rounds = pwdSaltRounds ? parseInt(pwdSaltRounds) : 10;
        const hash = await bcrypt.hash(password, rounds);
        payload.password = hash;
      }

      await User.findByIdAndUpdate(
        { _id },
        { $set: payload },
        { new: true },
      );
      let users = await User.find({ roleId: null }).sort({ updatedAt: -1 });
      return res.send({
        success: true,
        message: "User updated successfully",
        users,
      });
    } else
      return res
        .status(400)
        .send({ success: false, message: "User Id is required" });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "User");
    else return next(error);
  }
};
