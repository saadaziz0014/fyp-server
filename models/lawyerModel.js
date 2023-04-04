const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const lawyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cpassword: {
    type: String,
    required: true,
  },
  barcard: {
    type: String,
    required: true,
  },
  specialities: [
    {
      speciality: {
        type: String,
        required: true,
      },
    },
  ],
  messages: [
    {
      email: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  offersC: [
    {
      offer: {
        type: String,
        required: true,
      },
    },
  ],
  offersA: [
    {
      offer: {
        type: String,
        required: true,
      },
    },
  ],
  payment: {
    type: Number,
    required: true,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

//hash password
lawyerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  next();
});

lawyerSchema.methods.generateAuthToken = async function () {
  try {
    let tokenLawyer = jwt.sign({ _id: this._id }, process.env.SECRETL);
    this.tokens = this.tokens.concat({ token: tokenLawyer });
    await this.save();
    return tokenLawyer;
  } catch (err) {
    console.log(err);
  }
};

lawyerSchema.methods.addMessage = async function (email, message) {
  try {
    this.messages = this.messages.concat({ email, message });
    await this.save();
    return message;
  } catch (err) {
    return err;
  }
};

lawyerSchema.methods.addVerifyability = async function () {
  try {
    this.verify = true;
    await this.save();
    return "Success";
  } catch (err) {
    return err;
  }
};

lawyerSchema.methods.addPayment = async function (pay) {
  try {
    if (pay > 0) {
      this.payment = this.payment + pay;
      await this.save();
      return 201;
    }
    return 422;
  } catch (err) {
    console.log(err);
  }
};

const lawyerModel = new mongoose.model("lawyerModel", lawyerSchema);
module.exports = lawyerModel;
