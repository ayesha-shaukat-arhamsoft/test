const express = require("express");
const authRoutes = require("./auth.route");
const userRoutes = require("./user.route");
const settingsRoutes = require("./settings.route");
const faqRoutes = require("./faq.route");
const contactRoutes = require("./contact.route");
const cmsRoutes = require("./cms.route");
const footerRoutes = require("./footer.route");
const blogRoutes = require("./blog.route");
const blogCategoriesRoutes = require("./blog-category.route");
const blogPostsRoutes = require("./blog-post.route");
const aboutUsRoutes = require("./about-us.route");
const notificationsRoutes = require("./notification.route");

const router = express.Router();
/**
 * v1/front
 */
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/settings", settingsRoutes);
router.use("/faqs", faqRoutes);
router.use("/contact", contactRoutes);
router.use("/informative", cmsRoutes);
router.use("/footer", footerRoutes);
router.use("/blogs/blogs", blogRoutes);
router.use("/blogs/blog-categories", blogCategoriesRoutes);
router.use("/blogs/blog-posts", blogPostsRoutes);
router.use("/about-us", aboutUsRoutes);
router.use("/notifications", notificationsRoutes);

module.exports = router;
