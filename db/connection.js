const mongoose = require("mongoose");
const DBSTRING = process.env.DBSTRING;
mongoose
  .connect(DBSTRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection Success");
  })
  .catch(() => {
    console.log("Connection Failed");
  });
