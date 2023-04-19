const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  cases: [
    {
      description: {
        type: String,
        required: true,
      },
      budget: {
        type: Number,
        required: true,
      },
      bids: [
        {
          emailL: {
            type: String,
            required: true,
          },
          message: {
            type: String,
            required: true,
          },
          offer: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  ],
});

const caseModel = mongoose.model("caseModel", caseSchema);
module.exports = caseModel;
