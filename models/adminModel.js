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
  escrow: [
    {
      emailc: {
        type: String,
        required: true,
      },
      emaill: {
        type: String,
        required: true,
      },
      payment: {
        type: Number,
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

adminSchema.methods.escrowpayment = async function (emailc, emaill, payment) {
  try {
    if (payment >= 0) {
      this.escrow = this.escrow.concat({ emailc, emaill, payment });
      await this.save();
      return 201;
    }
  } catch (err) {
    console.log(err);
  }
};

const adminModel = new mongoose.model("adminModel", adminSchema);
module.exports = adminModel;
