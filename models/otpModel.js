const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  code: {
    type: Number,
    required: true,
  },
  expire: {
    type: Date,
    required: true,
  },
});

const otpModel = new mongoose.model("otpModel", otpSchema);

module.exports = otpModel;
