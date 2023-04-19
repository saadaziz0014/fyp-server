const mongoose = require("mongoose");
const offerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  offers: [
    {
      description: {
        type: String,
        required: true,
      },
      initial: {
        type: Number,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
    },
  ],
});

offerSchema.methods.message = async function (email, mess) {
  try {
    let messg = `From ${email}: ${mess}`;
    this.offers = this.offers.concat({ message: messg });
    await this.save();
    return messg;
  } catch (err) {
    console.log(err);
  }
};

const offerModel = mongoose.model("offerModel", offerSchema);
module.exports = offerModel;
