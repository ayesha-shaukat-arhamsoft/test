const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/admin/blog-post.controller");
const { cpUpload, uploadContentImage } = require("../../../utils/upload");

router.route("/create").post(cpUpload, controller.create);
router
  .route("/upload")
  .post(uploadContentImage, controller.uploadContentPageImg);
router.route("/edit").put(cpUpload, controller.edit);
router.route("/delete/:id").delete(controller.delete);
router.route("/get/:id").get(controller.get);
router.route("/list").get(controller.list);

module.exports = router;
