const jwt = require("jsonwebtoken");
const Lawyer = require("../models/lawyerModel");
const authL = async (req, res, next) => {
  try {
    const token = req.cookies.lawyerlogintoken;
    //console.log(token);
    const verifyy = jwt.verify(token, process.env.SECRETL);

    const mylawyer = await Lawyer.findOne({
      _id: verifyy._id,
      "tokens.token": token,
      verify: true,
    });

    if (!mylawyer) {
      throw new Error("Unauthorized or Not Verify");
    }

    req.token = token;
    req.mylawyer = mylawyer;
    req.id = mylawyer._id;
    next();
  } catch (err) {
    res.status(401).send({ error: "un" });
    console.log(err);
  }
};

module.exports = authL;
