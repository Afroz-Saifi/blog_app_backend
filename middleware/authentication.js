const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Blacklist } = require("../models/blacklist");

const authentication = async (req, res, next) => {
  try {
    const { access_token, refresh_token } = req.cookies;
    const black_access = await Blacklist.findOne({ access_token });
    const black_refresh = await Blacklist.findOne({ refresh_token });
    if (black_access || black_refresh) {
      return res.status(400).json({ msg: "please login again" });
    }
    const decoded = jwt.verify(access_token, process.env.access_token);
    if (!decoded) {
      return res
        .status(400)
        .json({ err: "you are not authorized, please login" });
    }
    const { email, role } = decoded;
    req.body.author_email = email;
    const user = { email, role };
    req.user = user;
    next();
  } catch (error) {
    return res.status(404).json({ msg: "please login" });
  }
};

module.exports = { authentication };
