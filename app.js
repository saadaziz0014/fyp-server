const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const express = require("express");
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
require("./db/connection");
const path = require("path");
app.use(cookieParser());
//app.use('/cards', express.static('cards'));
app.use('/cards', express.static(path.join(__dirname, "..", 'cards')));
app.use(require("./router/route"));

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});
