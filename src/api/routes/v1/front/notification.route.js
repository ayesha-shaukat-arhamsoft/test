const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/front/notification.controller");

router.route("/list").get(controller.list);
router.route("/edit/:userId").put(controller.edit);

module.exports = router;
