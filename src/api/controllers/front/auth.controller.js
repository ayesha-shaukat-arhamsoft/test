const moment = require("moment");
const passport = require("passport");
const CryptoJS = require("crypto-js");
const randomstring = require("randomstring");
const User = require("../../models/user.model");
const localStrategy = require("passport-local").Strategy;
const { sendEmail } = require("../../utils/emails/email");
const { uploadToCloudinary } = require("../../utils/upload");
const { baseUrl, frontendUrl } = require("../../../config/var");

exports.register = async (req, res, next) => {
  try {
    const { fullName, password, dob, type } = req.body;
    let { email } = req.body;

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
        .send({ success: false, message: "Date of birth is required!" });

    email = email?.toLowerCase();

    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(200)
        .send({ success: false, message: "User already exists" });
    }

    const rndToken = randomstring.generate({
      length: 16,
      charset: "alphanumeric",
    });

    const userPayload = {
      fullName,
      email,
      password,
      emailVerificationToken: rndToken,
    };

    if ((type && type === 2 && dob) || dob) {
      userPayload.dob = moment(new Date(dob));
      userPayload.type = 2; // member
    }

    user = await User.create(userPayload);

    await sendEmail(
      email,
      user.type === 1 ? "register-user" : "register-member"
    );

    const encodedEmail = encodeURIComponent(email);
    const content = {
      "${url}": `${baseUrl}v1/front/auth/verify-email?token=${rndToken}&email=${encodedEmail}`,
      "${fullName}": user.fullName,
    };
    await sendEmail(email, "email-verification", content);

    const accessToken = await user.token();
    user = user.transform();

    const data = {
      ...user,
      accessToken,
    };

    return res.status(200).send({
      success: true,
      message:
        "We have sent you an email. Please verify your account to proceed.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// returns jwt token if valid email and password is provided
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token, email } = req.query;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .send({ success: false, data: null, message: "User not found!" });

    if (!user.emailVerificationToken)
      return res.status(200).send({
        success: false,
        data: null,
        message: "User verification token not found!",
      });

    if (user.emailVerificationToken === token) {
      await User.findByIdAndUpdate(user._id, {
        $set: { isVerified: true, emailVerificationToken: undefined },
      });
      res.redirect(`${frontendUrl}/login`);
    } else
      return res
        .status(400)
        .send({ success: false, message: "User could not be verified!" });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    let { email } = req.body;
    email = email?.toLowerCase();

    if (email && password) {
      passport.use(
        new localStrategy(
          { usernameField: "email" },
          async (username, password, done) => {
            const user = await User.findOne({ email: username, roleId: null }).populate({ path: "roleId", select: "title" });

            switch (true) {
              case !user:
                return done(null, false, {
                  success: false,
                  message: "User does not exist!",
                });
              case user?.password === undefined:
                return done(null, false, {
                  success: false,
                  message: "Incorrect email or password",
                });
              case !user.verifyPassword(password):
                return done(null, false, {
                  success: false,
                  message: "Incorrect email or password",
                });
              case !user.isVerified:
                return done(null, false, {
                  success: false,
                  message: "Please verify your account",
                });
              default:
                return done(null, user);
            }
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
          const accessToken = await user.token();
          user["password"] = undefined;
          user["resetPasswordToken"] = undefined;

          user = user.transform();

          const data = {
            user: { ...user, accessToken },
          };

          await User.updateOne(
            { _id: user._id },
            { $set: { accessToken } },
            { upsert: true }
          );
          return res.status(200).send({
            success: true,
            message: "You have logged in successfully",
            data,
          });
        }
        // unknown user or wrong password
        else
          return res
            .status(200)
            .send({ success: false, message: info.message });
      })(req, res);
    } else
      return res
        .status(200)
        .send({ success: false, message: "Email & password required" });
  } catch (error) {
    return next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    let { email } = req.body;

    if (!email)
      return res
        .status(400)
        .send({ success: false, message: "Please provide email." });

    email = email.toLowerCase();

    const user = User.findOne({ email });

    if (user) {
      const resetPasswordToken = randomstring.generate({
        length: 8,
        charset: "alphanumeric",
      });
      user.resetPasswordToken = resetPasswordToken;
      user.save();

      const content = {
        "${url}": `${frontendUrl}/reset-password/${resetPasswordToken}`,
      };
      await sendEmail(user.email, "forgot-password", content);
      return res.status(200).send({ success: true, message: "Email has been sent successfully" });
    } else
      return res.status(200).send({
        success: false,
        message: "User not found against this information!",
      });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password, resetPasswordToken } = req.body;

    const user = await User.findOne({ resetPasswordToken });

    if (user) {
      user.resetPasswordToken = undefined;
      user.password = password;
      user.xOauth = CryptoJS.AES.encrypt(password, "SecureWay");
      user.save();

      // password has been reset successfully
      return res.status(200).send({
        success: true,
        message: "Your password is changed successfully!",
      });
    } else {
      return res.status(400).send({
        message:
          "Unsuccessful! Your reset token has been expired or no token exists. Kindly, make request again for password reset",
        success: false,
      });
    }
  } catch (error) {
    return next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { body: { newPwd, currentPwd }, user: userId } = req;
    const user = await User.findOne({ _id: userId });

    if (user?.verifyPassword(currentPwd)) {
      user.password = newPwd;
      user.xOauth = CryptoJS.AES.encrypt(newPwd, "SecureWay");
      user.save();

      // password has been successfully change
      return res.status(200).send({
        success: true,
        message: "Your password is changed successfully!",
      });
    } else {
      return res.status(400).send({
        message: "Unsuccessful! Current password not matched",
        success: false,
      });
    }
  } catch (error) {
    return next(error)
  }
};

exports.editProfile = async (req, res, next) => {
  try {
    const { body: payload, files, user: userId } = req;

    if (payload.newEmail) {
      const user = User.findOne({ _id: userId });

      if (user?.verifyPassword(payload.password)) {
        user.email = payload.newEmail;
        user.save();
        const data = user.transform();
        return res.status(200).send({
          success: true,
          data,
          message: "Your profile is updated successfully.",
        });
      } else {
        return res.status(400).send({
          message: "Unsuccessful! Invalid password.",
          success: false,
        });
      }
    } else {
      if (files) {
        for (const key in files) {
          const image = files[key][0];
          payload[key] = await uploadToCloudinary(image.path);
          payload[`${key}Local`] = image.filename;
        }
      }

      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: payload },
        { new: true }
      );

      const userData = user.transform();
      const data = {
        ...userData,
      };

      return res.send({
        success: true,
        data,
        message: "Your profile is updated successfully.",
      });
    }
  } catch (error) {
    return next(error);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const { body = payload, files } = req;
    if (files) {
      for (const key in files) {
        const image = files[key][0];
        payload[key] = await uploadToCloudinary(image.path);
        payload[`${key}Local`] = image.filename;
      }
    }

    await User.findByIdAndUpdate({ _id: payload._id }, { $set: payload });

    return res.send({
      success: true,
      message: "Your profile banner updated successfully.",
    });
  } catch (error) {
    return next(error);
  }
}