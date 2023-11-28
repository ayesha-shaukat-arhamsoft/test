const User = require("../../models/user.model");
const {
  pwEncryptionKey,
  byPassedRoutes,
} = require("./../../../config/var");
const jwt = require("jsonwebtoken");

exports.authenticate = async (req, res, next) => {
  if (req.originalUrl.indexOf("/v1/") > -1) {
    if (
      byPassedRoutes.indexOf(req.originalUrl) > -1 ||
      req.originalUrl.includes("/v1/front/auth/verify-email?")
    ) {
      next();
    } else {
      if (req.headers["x-auth-token"]) {
        const decryption_string = req.headers["x-auth-token"];

        if (req.token) {
          next();
        } else if (req.method.toLocaleLowerCase() !== "options") {
          const message = "auth_request_required_front_error2";
          return res.status(405).json({ success: false, message });
        } else {
          next();
        }
      } else if (
        req.method.toLocaleLowerCase() !== "options" &&
        req.url.indexOf("/v1/admin/staff/private-admin") > -1
      ) {
        next();
      } else if (req.method.toLocaleLowerCase() !== "options") {
        const message = "auth_request_required_front_error3";
        return res.status(405).json({ success: false, message });
      } else {
        next();
      }
    }
  } else {
    next();
  }
};

exports.userValidation = async (req, res, next) => {
  let flag = true;
  req.user = 0;
  if (req.headers["x-access-token"]) {
    await jwt.verify(
      req.headers["x-access-token"],
      pwEncryptionKey,
      async (err, authorizedData) => {
        if (err) {
          flag = false;
          const message = "session_expired_front_error";
          return res.send({ success: false, userDisabled: true, message, err });
        } else {
          // const reqPlatform = Number(req.headers['user-platform'])
          req.user = authorizedData.sub;
          // if (reqPlatform === 1) {
          let user = await User.findById({ _id: req.user }).lean();
          if (!user) {
            flag = false;
            return res.send({
              success: false,
              user404: true,
              message: "There is no account linked to that id",
              notExist: 1,
            });
          }
          // }
          // else if (reqPlatform === 2) {
          //     let admin = await User.findById({ _id: req.user }).lean();
          //     if (!admin) {
          //         flag = false;
          //         return res.send({ success: false, user404: true, message: 'There is no account linked to that id', notExist: 1 });
          //     }
          // }
        }
      }
    );
  } else if (req.method.toLocaleLowerCase() !== "options") {
    req.user = 0;
  }

  if (flag) next();
};
