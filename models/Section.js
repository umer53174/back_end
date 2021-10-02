const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const SectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  keys: { type: String, required: true },
});

const Section = new mongoose.model("Section", SectionSchema);
module.exports = Section;
