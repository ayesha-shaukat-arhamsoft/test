const express = require("express");
const controller = require("../../../controllers/front/auth.controller");
const router = express.Router();

router.route("/register").post(controller.register);
router.route("/verify-email").get(controller.verifyEmail);
router.route("/login").post(controller.login);
router.route("/forgot-password").post(controller.forgotPassword);
router.route("/reset-password").post(controller.resetPassword);
router.route("/change-password").put(controller.changePassword);
router.route("/edit-profile").put(controller.editProfile);

module.exports = router;
