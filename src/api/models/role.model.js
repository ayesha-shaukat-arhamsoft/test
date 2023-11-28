const mongoose = require("mongoose");

const Roles = new mongoose.Schema(
  {
    title: { type: String, required: true, lowercase: true, unique: true },

    /**  system permissions **/

    viewDashboard: { type: Boolean, default: false },

    // staff's records
    addStaff: { type: Boolean, default: false },
    editStaff: { type: Boolean, default: false },
    deleteStaff: { type: Boolean, default: false },
    viewStaff: { type: Boolean, default: false },

    // permissions
    addRole: { type: Boolean, default: false },
    editRole: { type: Boolean, default: false },
    deleteRole: { type: Boolean, default: false },
    viewRole: { type: Boolean, default: false },

    // users records
    addUser: { type: Boolean, default: false },
    editUser: { type: Boolean, default: false },
    deleteUser: { type: Boolean, default: false },
    viewUsers: { type: Boolean, default: false },

    // plans
    addPlan: { type: Boolean, default: false },
    editPlan: { type: Boolean, default: false },
    deletePlan: { type: Boolean, default: false },
    viewPlan: { type: Boolean, default: false },

    // blog categories
    addBlogCategory: { type: Boolean, default: false },
    viewBlogCategories: { type: Boolean, default: false },
    deleteBlogCategory: { type: Boolean, default: false },
    editBlogCategory: { type: Boolean, default: false },

    // blogs
    addBlog: { type: Boolean, default: false },
    editBlog: { type: Boolean, default: false },
    deleteBlog: { type: Boolean, default: false },
    viewBlogs: { type: Boolean, default: false },

    // blog posts
    addBlogPost: { type: Boolean, default: false },
    editBlogPost: { type: Boolean, default: false },
    deleteBlogPost: { type: Boolean, default: false },
    viewBlogPosts: { type: Boolean, default: false },

    // EmailTemplates
    viewEmailTemplates: { type: Boolean, default: false },
    addEmailTemplates: { type: Boolean, default: false },
    editEmailTemplates: { type: Boolean, default: false },
    deleteEmailTemplates: { type: Boolean, default: false },

    //FaqCategories
    viewFaqCategories: { type: Boolean, default: false },
    addFaqCategories: { type: Boolean, default: false },
    editFaqCategories: { type: Boolean, default: false },
    deleteFaqCategories: { type: Boolean, default: false },

    // FAQs
    addFaq: { type: Boolean, default: false },
    editFaq: { type: Boolean, default: false },
    deleteFaq: { type: Boolean, default: false },
    viewFaqs: { type: Boolean, default: false },

    // content
    viewContent: { type: Boolean, default: false },
    addContent: { type: Boolean, default: false },
    editContent: { type: Boolean, default: false },
    deleteContent: { type: Boolean, default: false },

    // contact
    viewContact: { type: Boolean, default: false },
    editContact: { type: Boolean, default: false },
    deleteContact: { type: Boolean, default: false },

    // settings
    viewSetting: { type: Boolean, default: false },
    editSetting: { type: Boolean, default: false },

    // newsletter/subscriptions
    viewNewsLetter: { type: Boolean, default: false },

    // status (i.e: true for active & false for in-active)
    status: { type: Boolean, default: false },
    superAdminRole: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

Roles.index({ identityNumber: "title" });

module.exports = mongoose.model("Roles", Roles);
