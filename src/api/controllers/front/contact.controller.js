const Contact = require("../../models/contact.model");

exports.create = async (req, res, next) => {
  try {
    const { body: payload } = req;

    if (!payload.name)
      return res
        .status(200)
        .send({ success: false, message: "Name is required!" });

    if (!payload.email)
      return res
        .status(200)
        .send({ success: false, message: "Email is required!" });

    if (!payload.subject && !payload.aboutUsPage)
      return res
        .status(200)
        .send({ success: false, message: "Subject is required!" });

    if (!payload.message)
      return res
        .status(200)
        .send({ success: false, message: "Message is required!" });

    const contact = await Contact.create(payload);

    return res.status(200).send({
      success: true,
      data: contact,
      message: "Your query has been successfully sent!",
    });
  } catch (error) {
    return next(error);
  }
};
