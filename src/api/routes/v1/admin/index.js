const express = require("express");
const userRoutes = require("./user.route");
const adminRoutes = require("./admin.route");
const roleRoutes = require("./role.route");
const emailRoutes = require("./email.route");
const settingsRoutes = require("./settings.route");
const faqRoutes = require("./faq.route");
const contactRoutes = require("./contact.route");
const cmsRoutes = require("./cms.route");
const newsletterRoutes = require("./newsletter.route");
const faqCategoriesRoutes = require("./faq-category.route");
const blogCategoryRoutes = require("./blog-category.route");
const blogRoutes = require("./blog.route");
const blogPostsRoutes = require("./blog-post.route");
const ckEditorRoute = require("./ckEditor.route");
const notificationsRoutes = require("./notification.route");

const router = express.Router();

/**
 * v1/admin
 */
router.use("/staff", adminRoutes);
router.use("/role", roleRoutes);
router.use("/user", userRoutes);
router.use("/email", emailRoutes);
router.use("/settings", settingsRoutes);
router.use("/faq", faqRoutes);
router.use("/contacts", contactRoutes);
router.use("/content", cmsRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/faq-categories", faqCategoriesRoutes);
router.use("/blogs/blog-categories", blogCategoryRoutes);
router.use("/blogs/blogs", blogRoutes);
router.use("/blogs/blog-posts", blogPostsRoutes);
router.use("/ck-editor", ckEditorRoute);
router.use("/notifications", notificationsRoutes);

module.exports = router;
