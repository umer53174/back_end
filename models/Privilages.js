const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Privilege = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  keys: { type: String, required: true },

  section_id: {
    type: Object,
    required: true,
  },
});

const privilege = new mongoose.model("Privilege", Privilege);
module.exports = privilege;
