const Email = require("../../models/email.model");
const Settings = require("../../models/settings.model");
const { frontendUrl } = require("../../../config/var");

// send email to mentioned users
exports.sendEmail = async (
  email = "",
  type = "",
  content = null,
  subject = ""
) => {
  if (email) {
    const getTemplate = await Email.findOne({ type });

    if (getTemplate) {
      const settings = await Settings.findOne();
      const { api: apiKey, domain, email: siteEmail } = settings;
      const mailgun = require("mailgun-js")({ apiKey, domain });

      let sub = "";
      if (subject) {
        sub = subject;
      } else {
        sub = getTemplate.subject;
      }

      const msg = {
        to: email,
        from: siteEmail,
        subject: sub,
        html: getHtml(getTemplate, content),
      };

      mailgun.messages().send(msg);
    }
  }
};

const getHtml = (getTemplate, content) => {
  let text = getTemplate.text;
  if (content) {
    for (let key in content) {
      text = text.replace(`${key}`, `${content[key]}`);
    }
  }

  text = text.replaceAll("${platformUrl}", `${frontendUrl}`);
  text = text.replaceAll("${faqsUrl}", `${frontendUrl}/faqs`);

  return text;
};
