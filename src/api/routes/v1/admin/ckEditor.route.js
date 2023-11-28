const express = require("express");
const router = express.Router();
const { uploadContentImage } = require("../../../utils/upload");

const uploadCkEditorImages = async (req, res, next) => {
  try {
    if (req.file) {
      return res.status(200).send({
        success: true,
        message: "Image uploaded successfully!",
        imageData: req.file,
      });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "Image not found!" });
    }
  } catch (err) {
    next(err);
  }
};

router.route("/upload").post(uploadContentImage, uploadCkEditorImages);

module.exports = router;
