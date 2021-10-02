const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcryptjs");
/// creating schema //
const studentSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: { type: String, required: true },

  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles_ids: {
    type: Object,
    required: true,
  },

  defaultprev:{
    
    type: Object,
    
  },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//  We will create a new Collection

////
studentSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
studentSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECERT_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};
const Student = new mongoose.model("Student", studentSchema);
module.exports = Student;
