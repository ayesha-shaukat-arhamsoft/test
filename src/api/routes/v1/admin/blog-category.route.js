const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/admin/blog-category.controller");

router.route("/create").post(controller.create);
router.route("/edit").put(controller.edit);
router.route("/delete/:id").delete(controller.delete);
router.route("/get/:id").get(controller.get);
router.route("/list").get(controller.list);

module.exports = router;
