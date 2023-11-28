const Role = require("../../models/role.model");
const User = require("../../models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;

// API to create role
exports.create = async (req, res, next) => {
  try {
    const role = req.body;

    await Role.create(role);
    return res
      .status(200)
      .send({ success: true, message: "Role created successfully" });
  } catch (error) {
    return next(error);
  }
};

// API to edit role
exports.edit = async (req, res, next) => {
  try {
    const { body: { _id }, body: payload } = req;

    const role = await Role.findOne({ _id });

    if (role) {
      for (let x in payload) // making key value pair
        if (typeof payload[x] != "string" && payload[x] != undefined)
          role[x] = payload[x]; // for type of array, boolean etc.
        else if (
          typeof payload[x] == "string" &&
          payload[x] != "" &&
          payload[x] != undefined
        )
          role[x] = payload[x];
      const result = await Role.findByIdAndUpdate({ _id }, { $set: role });

      if (result)
        return res.status(200).send({
          result,
          success: true,
          message: "Role updated successfully",
        });
      else
        return res.status(422).send({ success: false, message: 'Role not found' });
    } else
      return res
        .status(400)
        .send({ success: false, message: "No role found for given Id" });
  } catch (error) {
    return next(error);
  }
};

// API to delete role
exports.delete = async (req, res, next) => {
  try {
    const { _id } = req.query;

    const { deletedCount } = await Role.remove({ _id });

    if (deletedCount) {
      res
        .status(200)
        .send({ success: true, message: "Role deleted successfully" });

      // setting user role to null
      User.updateMany(
        { roleId: ObjectId(_id) },
        { $set: { roleId: 0 } });
    } else
      return res
        .status(400)
        .send({ success: false, message: "No role found with given id" });
  } catch (error) {
    next(error);
  }
};

// API to get role
exports.get = async (req, res, next) => {
  try {
    const { _id } = req.query;

    const role = await Role.findOne({ _id });

    if (role) return res.status(200).send({ success: true, role });
    else
      return res
        .status(400)
        .send({ success: false, message: "No role found for given Id" });
  } catch (error) {
    next(error);
  }
};

// API to list all roles
exports.list = async (req, res, next) => {
  try {
    let { page, limit, query, all, title, status } = req.query;
    let filter = {};

    page = page != undefined && page != "" ? parseInt(page) : 1;
    limit = limit != undefined && limit != "" ? parseInt(limit) : 10;

    if (all != undefined && all != "") limit = await Role.countDocuments({});

    if (title) filter.title = { $regex: title, $options: "i" };

    if (status) {
      if (String(status)?.toLowerCase() === "true") {
        filter.status = true;
      } else if (String(status)?.toLowerCase() === "false") {
        filter.status = false;
      }
    }

    const total = await Role.countDocuments(filter);

    let rolesData = await Role.aggregate([
      {
        $match: filter,
      },
      { $sort: { createdAt: -1 } },
      { $project: { createdAt: 0, updatedAt: 0, __v: 0 } },
      { $skip: limit * (page - 1) },
      { $limit: limit },
    ]);
    return res.status(200).send({
      success: true,
      message: "Roles retrieved successfully",
      data: rolesData,
      page,
      pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit),
      total,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

// API to get roles list by name only
exports.getRolesByName = async (req, res, next) => {
  try {
    const { isPartner } = req.query;
    let filter = { status: true };

    if (String(isPartner)?.toLowerCase() === "true" || isPartner === true) {
      filter = {
        $and: [{ status: true }, { title: { $ne: "admin" } }],
      };
    }

    const roles = await Role.find(filter, "title").sort("title");
    if (roles) return res.status(200).send({ success: true, roles });
    else return res.status(400).send({ success: false, message: 'Found error while finding roles by name' });
  } catch (error) {
    next(error);
  }
};
