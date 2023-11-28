const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/admin/notification.controller");

router.route("/list").get(controller.list);
router.route("/edit").put(controller.edit);

module.exports = router;
