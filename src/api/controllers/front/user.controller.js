const moment = require("moment");
const User = require("../../models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;
const { uploadToCloudinary } = require("../../utils/upload");
const { baseUrl } = require("../../../config/var");
const { sendEmail } = require("../../utils/emails/email");
const randomstring = require("randomstring");

exports.update = async (req, res, next) => {
  try {
    const payload = req.body;
    const userId = req.user;
    let user = null;
    let emailChanged = false;

    const { updateType } = payload;
    delete payload["updateType"];

    if (Number(updateType) === 1) {
      if (!payload.fullName)
        return res
          .status(400)
          .send({ success: false, message: "Name is required" });

      if (!payload.email)
        return res
          .status(400)
          .send({ success: false, message: "Email is required" });

      if (Number(payload.type) === 2 && !payload.dob)
        return res
          .status(400)
          .send({ success: false, message: "Date of Birth is required" });

      if (Object.keys(req.files)?.length) {
        for (const key in req.files) {
          const image = req.files[key][0];
          payload[key] = await uploadToCloudinary(image.path);
          payload[`${key}Local`] = image.filename;
        }
      } else {
        delete payload.profileImage;
      }

      const data = await User.findById(userId, { email: 1 });

      if (payload.email !== data.email) {
        emailChanged = true;

        const existingUser = await User.findOne({ email: payload.email });
        if (existingUser)
          return res.send({
            success: false,
            message: "User with this email already exists.",
            user,
          });

        const rndToken = randomstring.generate({
          length: 16,
          charset: "alphanumeric",
        });
        payload.emailVerificationToken = rndToken;
        payload.isVerified = false;

        // send verification email
        const content = {
          "${url}": `${baseUrl}v1/front/auth/verify-email?token=${rndToken}&email=${payload.email}`,
          "${fullName}": data.fullName,
        };
        await sendEmail(payload.email, "new-email-verification", content);
      }

      user = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: payload },
        { new: true },
      );
      user = { ...user._doc, emailChanged };
    } else {
      if (!payload.currentPassword)
        return res
          .status(400)
          .send({ success: false, message: "Current Password is required" });

      if (!payload.password)
        return res
          .status(400)
          .send({ success: false, message: "Password is required" });

      if (payload.currentPassword === payload.password)
        return res.status(400).send({
          success: false,
          message: "Current and New Password should not be same",
        });

      user = await User.findById(userId);

      if (!user) return res.send({ success: true, message: "User not found!" });

      if (!user.verifyPassword(payload.currentPassword))
        return res
          .status(400)
          .send({ success: false, message: "Current password is incorrect" });

      delete payload["currentPassword"];

      user.password = payload.password;
      user.save();
    }

    return res.send({
      success: true,
      message: emailChanged
        ? "A verification email has been sent to your updated email address. Please verify your account."
        : "Your profile is updated successfully.",
      user,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const { userId } = req.query;

    const user = await User.aggregate([
      {
        $match: { _id: ObjectId(userId) },
      },
      {
        $project: {
          fullName: 1,
          dob: 1,
          phone: 1,
          address: 1,
          email: 1,
          type: 1,
          profileImage: {
            $ifNull: [{ $concat: [baseUrl, "$profileImageLocal"] }, null],
          },
        },
      },
    ]);

    return res.send({
      success: true,
      data: {
        user: user[0],
      },
      message: "User fetched succesfully",
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteUserAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    return res.send({
      success: true,
      message: "Your account has been deleted!",
    });
  } catch (error) {
    return next(error);
  }
};

exports.uploadContent = async (req, res) => {
  try {
    const files = req.file ? `${req.file.filename}` : "";
    return res.json({
      success: true,
      message: "File upload successfully",
      data: files,
    });
  } catch (error) {
    return res.status(400).send({ success: false, message: error });
  }
};
