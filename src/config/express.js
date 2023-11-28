const cors = require("cors");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const bearerToken = require("express-bearer-token");
const frontAuth = require("../api/middlewares/front/auth");
const adminRoutes = require("../api/routes/v1/admin/index");
const frontRoutes = require("../api/routes/v1/front/index");
const error = require("../api/utils/error");
const { port } = require("../config/var");

/**
 * express instance
 */
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});
const apiRequestLimiterAll = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 90000,
});
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// set socket
io.on("connection", async (socket) => {
  app.set("socket", io);
});

app.use(bodyParser.json({ limit: "5000mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "5000mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(bearerToken());

app.use(express.static(path.join(__dirname, "../uploads")));
app.use(express.static(path.join(__dirname, "../../admin/static/css")));

app.use("/v1/", apiRequestLimiterAll);

app.use(cors(corsOptions));

// compress all responses
app.use(compression());

// authentication middleware to enforce authnetication and authorization
app.use(frontAuth.userValidation);

// authentication middleware to get token
app.use(frontAuth.authenticate);

// mount admin api v1 routes
app.use("/v1/admin", adminRoutes);

// mount admin api v1 routes
app.use("/v1/front", frontRoutes);

// admin site build path
app.use("/admin/", express.static(path.join(__dirname, "../../admin")));
app.get("/admin/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../../admin", "index.html"));
});

// front site build path
app.use("/", express.static(path.join(__dirname, "../../build")));
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../../build", "index.html"));
});

// if error is not an instance of API error, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

http.listen(port);

module.exports = app;
