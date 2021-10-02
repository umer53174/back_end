const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const addRoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  descrip: { type: String, required: true },

  defaultprev:{
    
    type: Object,
    
  },

});

const Student = new mongoose.model("UserRoles", addRoleSchema);
module.exports = Student;
