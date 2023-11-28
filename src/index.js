Promise = require("bluebird");
const { port } = require("./config/var");
const mongoose = require("./config/mongoose");
const app = require("./config/express");
app.set("view engine", "ejs");
mongoose.connect();

module.exports = app;
