const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const clientSchema = new mongoose.Schema({
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
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
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
  cases: [
    {
      case: {
        type: String,
        required: true,
      },
      proposal: {
        type: String,
        required: true,
      },
    },
  ],
});

//hash password
clientSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  next();
});

clientSchema.methods.generateAuthToken = async function () {
  try {
    let tokenClient = jwt.sign({ _id: this._id }, process.env.SECRETC);
    this.tokens = this.tokens.concat({ token: tokenClient });
    await this.save();
    return tokenClient;
  } catch (err) {
    console.log(err);
  }
};

clientSchema.methods.addMessage = async function (email, message) {
  try {
    this.messages = this.messages.concat({ email, message });
    await this.save();
    return message;
  } catch (err) {
    console.log(err);
  }
};

const clientModel = mongoose.model("clientModel", clientSchema);
module.exports = clientModel;
