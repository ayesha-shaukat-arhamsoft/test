const express = require('express');
const controller = require('../../../controllers/front/user.controller');
const router = express.Router();
const { profileUpload, uploadSingle } = require('../../../utils/upload')

router.route('/update').put(profileUpload, controller.update);
router.route('/get').get(controller.getUser);
router.route('/upload-image').post(uploadSingle, controller.uploadContent);
router.route('/delete/:id').delete(controller.deleteUserAccount);

module.exports = router;