const express = require("express");
const router = express.Router();
const controller = require("../../../controllers/front/about-us.controller");

router.route("/stats").get(controller.stats);

module.exports = router;
