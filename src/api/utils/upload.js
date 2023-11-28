const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary");
const {
  uploadsDir,
  cloudinaryName,
  cloudinaryApiKey,
  cloudinarySecret,
  directoryTypes,
} = require("../../config/var");

cloudinary.config({
  cloud_name: cloudinaryName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinarySecret,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // make uploads directory if do not exist
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    // create directories if not exist
    for (let i in directoryTypes) {
      if (!fs.existsSync(directoryTypes[i].dir)) {
        fs.mkdirSync(directoryTypes[i].dir);
      }
    }

    cb(null, uploadsDir);
  },
  filename: async function (req, file, cb) {
    const fileExtension = file.originalname.match(/\.([^\.]+)$/)[1];
    let dirName = "";
    for (let i in directoryTypes) {
      if (directoryTypes[i].types.includes(fileExtension)) {
        dirName = directoryTypes[i].name;
      }
    }
    if (!dirName) {
      return cb(new Error("File Type not allowed"));
    }

    cb(null, dirName + "/" + Date.now() + "." + fileExtension);
  },
});

const upload = multer({ storage });
exports.cpUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "screenShot", maxCount: 1 },
  { name: "icon", maxCount: 1 },
  { name: "files", maxCount: 1 },
  { name: "manifestFile", maxCount: 1 },
  { name: "crashLog", maxCount: 1 },
  { name: "featuredImage", maxCount: 1 },
  { name: "channelImage", maxCount: 1 },
  { name: "imageLocal", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
]);
exports.uploadSingle = upload.single("image");
exports.uploadContentImage = upload.single("files");
exports.videoUploads = upload.fields([
  { name: "thumbnails", maxCount: 5 },
  { name: "cardImages", maxCount: 5 },
  { name: "subtitleFile", maxCount: 1 },
  { name: "endScreenImage", maxCount: 1 },
]);
exports.objectUploads = upload.fields([
  { name: "objectCategoryImage", maxCount: 1 },
  { name: "objectImage", maxCount: 1 },
]);
exports.profileUpload = upload.fields([{ name: "profileImage", maxCount: 1 }]);
exports.uploadToCloudinary = async (data) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      data,
      (result) => {
        resolve(result.secure_url);
      },
      { resource_type: "auto" }
    );
  });
};
