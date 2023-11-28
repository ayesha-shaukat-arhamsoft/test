require("dotenv").config();
const uploadsDir = "./src/uploads/";

module.exports = {
  uploadsDir,
  createAdminReqUrl: `${process.env.BASE_URL}v1/admin/staff/private-admin/create-private-admin`,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  encryptionKey: process.env.ENCRYPTION_KEY,
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  frontEncSecret: process.env.FRONT_ENC_SECRET,
  emailAdd: process.env.EMAIL,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  mailgunApi: process.env.MAILGUN_API,
  pwEncryptionKey: process.env.PW_ENCRYPTION_KEY,
  pwdSaltRounds: process.env.PWD_SALT_ROUNDS,
  baseUrl: process.env.BASE_URL,
  appName: process.env.APP_NAME,
  frontendUrl: process.env.FRONT_APP_URL,
  adminPasswordKey: process.env.ADMIN_PASSWORD_KEY,
  xAuthToken: process.env.XAUTHTOKEN,
  authorization: process.env.AUTHORIZATION,

  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinarySecret: process.env.CLOUDINARY_SECRET,
  cloudinaryBaseUrl: process.env.CLOUDINARY_BASE_URL,
  defaultPlaceholderImage: `${process.env.CLOUDINARY_BASE_URL}v1674814102/placeholder_wka6yy.png`,
  userPlaceholderImage: `${process.env.CLOUDINARY_BASE_URL}v1674814089/user-icon-image-placeholder-300-grey_uwed1t.jpg`,
  siteLogo: `${process.env.CLOUDINARY_BASE_URL}v1674814170/logo_qrakhz.png`,

  events: {
    notifications: [
      {
        type: 1,
        name: "dummy-notification",
        label: "Dummy",
      },
    ],
  },

  privateAdminPermissionsKeys: {
    viewDashboard: true,

    // staff's records
    addStaff: true,
    editStaff: true,
    deleteStaff: true,
    viewStaff: true,

    // permissions
    addRole: true,
    editRole: true,
    deleteRole: true,
    viewRole: true,

    // users records
    addUser: true,
    editUser: true,
    deleteUser: true,
    viewUsers: true,

    // blog categories
    addBlogCategory: true,
    viewBlogCategories: true,
    deleteBlogCategory: true,
    editBlogCategory: true,

    // blogs
    addBlog: true,
    editBlog: true,
    deleteBlog: true,
    viewBlogs: true,

    // blog posts
    addBlogPost: true,
    editBlogPost: true,
    deleteBlogPost: true,
    viewBlogPosts: true,

    // EmailTemplates
    addEmailTemplates: true,
    editEmailTemplates: true,
    viewEmailTemplates: true,
    deleteEmailTemplates: true,

    //FaqCategories
    addFaqCategories: true,
    editFaqCategories: true,
    viewFaqCategories: true,
    deleteFaqCategories: true,

    // FAQs
    addFaq: true,
    editFaq: true,
    deleteFaq: true,
    viewFaqs: true,

    // content
    addContent: true,
    editContent: true,
    viewContent: true,
    deleteContent: true,

    // contact
    viewContact: true,
    editContact: true,
    deleteContact: true,

    // settings
    editSetting: true,
    viewSetting: true,

    // newsletter/subscriptions
    viewNewsLetter: true,

    superAdminRole: true,
    status: true,
    title: "Super Admin",
  },

  directoryTypes: [
    {
      name: "images",
      dir: `${uploadsDir}images/`,
      types: ["jpg", "jpeg", "png", "gif", "svg"],
    },
  ],

  byPassedRoutes: [
    "/v1/cron/conversion/rate/",
    "/v1/admin/staff/create",
    "/v1/front/test",
    "/v1/front/auth/login",
    "/v1/admin/staff/login",
    "/v1/front/auth/register",
    "/v1/front/auth/forgot-password",
    "/v1/front/auth/reset-password",
    "/v1/front/auth/verify-email",
    "/v1/mobile/auth/sigin",
    "/v1/mobile/auth/signup",
    "/v1/mobile/auth/forgotPassword",
    "/v1/front/games/get-games",
    "/v1/front/stripe/webhook",
  ],
};
