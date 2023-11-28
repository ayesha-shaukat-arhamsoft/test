const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/front/blog-category.controller");

router.route("/get/:id").get(controller.get);
router.route("/list").get(controller.list);
router.route("/highlighted").get(controller.highlighted);

module.exports = router;
