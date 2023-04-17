const mongoose = require("mongoose");

const blacklist_schema = new mongoose.Schema({
  access_token: { type: String, required: true },
  refresh_token: { type: String, required: true },
});

const Blacklist = mongoose.model("blacklist", blacklist_schema);

module.exports = { Blacklist };
