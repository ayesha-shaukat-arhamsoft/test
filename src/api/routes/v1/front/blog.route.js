const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/front/blog.controller");

router.route("/get/:id").get(controller.get);
router.route("/list").get(controller.list);
router.route("/getlatest").get(controller.getlatest);
router.route("/featured").get(controller.getfeatured);
router.route("/explore").get(controller.explore);
router.route("/trending").get(controller.trending);

module.exports = router;
