const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
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

adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

adminSchema.methods.generateAuthToken = async function () {
  try {
    let tokenAdmin = jwt.sign({ _id: this._id }, process.env.SECRETA);
    this.tokens = this.tokens.concat({ token: tokenAdmin });
    await this.save();
    return tokenAdmin;
  } catch (err) {
    console.log(err);
  }
};

const adminModel = new mongoose.model("adminModel", adminSchema);
module.exports = adminModel;
