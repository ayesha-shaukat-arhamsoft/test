const mongoose = require("mongoose");
const Contact = require("../../models/contact.model");
const { checkDuplicate } = require("../../utils/error");

// API to get support list
exports.list = async (req, res, next) => {
  try {
    let { query: { page = 1, limit = 10 }, body: { name, email } } = req;
    const { status } = req.body;
    const filter = {};

    page = Number(page);
    limit = Number(limit);

    if (name) {
      name = name.trim();
      filter.name = {
        $regex: name.replace(
          /[-\/\\^$*+?.()|[\]{}]/g,
          "\\$&"
        ) /* $options: 'gi' */,
      };
    }

    if (email) {
      filter.email = email.toLowerCase().trim();
    }

    if (status != undefined) {
      filter.status = Number(status);
    }

    const total = await Contact.countDocuments(filter);

    if (page > Math.ceil(total / limit) && total > 0)
      page = Math.ceil(total / limit);

    const contact = await Contact.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: limit * (page - 1) },
      { $limit: limit },
    ]);

    return res.send({
      success: true,
      message: "Contacts data fetched successfully",
      data: {
        contact,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

// API to edit contact status
exports.edit = async (req, res, next) => {
  try {
    const { _id, status } = req.body;
    const updatedContact = await Contact.findByIdAndUpdate(
      { _id },
      {
        $set: {
          status
        }
      },
      { new: true }
    );
    return res.send({
      success: true,
      message: "Support form updated successfully",
      updatedContact,
    });
  } catch (error) {
    if (error.code === 11000 || error.code === 11001)
      checkDuplicate(error, res, "Contact");
    else return next(error);
  }
};
