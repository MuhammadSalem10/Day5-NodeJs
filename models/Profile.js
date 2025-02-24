const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  empId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  yearOfExperience: {
    type: Number,
    default: 0,
  },
  department: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Basic email validation
      },
      message: "Email is not valid!",
    },
  },
});

module.exports = mongoose.model("Profile", profileSchema);
