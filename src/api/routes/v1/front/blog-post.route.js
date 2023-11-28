const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/front/blog-post.controller");

router.route("/get").get(controller.get);
router.route("/list").get(controller.list);

module.exports = router;
