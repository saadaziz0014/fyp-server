const express = require("express");
const route = express.Router();
const Client = require("../models/clientModel");
const Lawyer = require("../models/lawyerModel");
const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authA = require("../middleware/authAdmin");
const authC = require("../middleware/authClient");
const authL = require("../middleware/authLawyer");
const nodemailer = require("nodemailer");
const OTP = require("../models/otpModel");
const { log } = require("console");

let emailpass = " ";
let filename;

//card uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "cards/");
  },
  filename: async (req, file, cb) => {
    const { name, email, password, cpassword } = req.body;

    if (name && email && password && cpassword && file) {
      if (password == cpassword) {
        const checkExist = await Lawyer.findOne({ email: email });
        if (!checkExist) {
          filename = email + path.extname(file.originalname);
          cb(null, filename);
        } else {
          return cb(new Error("Email Exist"));
        }
      } else {
        return cb(new Error("Password Mismatch"));
      }
    } else {
      return cb(new Error("All Field Required"));
    }
  },
});
const upload = multer({ storage: storage });
route.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer errors (e.g. file size exceeded) will have a `code` property
    res.status(422).json({ error: `Multer error: ${err.code}` });
  } else if (err) {
    // Other errors (e.g. missing email field) will not have a `code` property
    res.status(422).json({ error: err.message });
  } else {
    next();
  }
});

//by default
route.get("/", async (req, res) => {
  try {
    res.send(`<h1>Saad</h1>`);
  } catch (err) {
    console.log(err);
  }
});

//signups
route.post("/clientsignup", async (req, res) => {
  try {
    const { name, email, password, cpassword } = req.body;
    if (!name || !email || !password || !cpassword) {
      return res.status(422).json({ error: "Required All Field" });
    }
    if (password != cpassword) {
      return res.status(422).json({ error: "Password not match" });
    }
    const checkExist = await Client.findOne({ email: email });
    if (checkExist) {
      return res.status(422).json({ error: "Email Used" });
    }
    const client = new Client({ name, email, password, cpassword });
    await client.save();
    return res.status(201).json({ message: "Data Saved" });
  } catch (err) {
    return res.status(401).json({ error: err });
  }
});
route.post("/lawyersignup", upload.single("file"), async (req, res) => {
  try {
    const { name, email, password, cpassword } = req.body;
    //const barcard = req.file;
    console.log(name, email, password, cpassword);

    if (!name || !email || !password || !cpassword) {
      return res.status(422).json({ error: "Required All Field" });
    }
    if (password != cpassword) {
      return res.status(422).json({ error: "Password not match" });
    }
    const checkExist = await Lawyer.findOne({ email: email });
    if (checkExist) {
      return res.status(422).json({ error: "Email Used" });
    }

    console.log(filename);

    if (!filename) {
      return res.status(422).json({ error: "Card not Present" });
    }
    let barcard = `/cards/${filename}`;
    const lawyer = new Lawyer({ name, email, password, cpassword, barcard });
    await lawyer.save();
    return res.status(201).json({ message: "Data Saved" });
  } catch (err) {
    console.log(err);

    return res.status(401).json({ error: err });
  }
});

//logins
route.post("/clientlogin", async (req, res) => {
  try {
    console.log("In route");
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ error: "Fill all Inputs" });
    }
    const responce = await Client.findOne({ email: email });
    if (responce) {
      const matching = await bcrypt.compare(password, responce.password);
      if (matching) {
        const tokenClient = await responce.generateAuthToken();
        //console.log(tokenClient);

        //storing in cookies

        res.cookie("clientlogintoken", tokenClient, {
          expires: new Date(Date.now() + 20 * 60000),
          httpOnly: true,
        });

        return res.status(200).json({ message: "Login" });
      } else {
        return res.status(422).json({ error: "Invalid cred pass" });
      }
    } else {
      return res.status(440).json({ error: "Invalid cred email" });
    }
  } catch (err) {
    console.log(err);
  }
});
route.post("/lawyerlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ error: "Fill all Inputs" });
    }
    const responce = await Lawyer.findOne({ email: email });
    if (responce) {
      const matching = await bcrypt.compare(password, responce.password);
      if (matching) {
        const tokenLawyer = await responce.generateAuthToken();
        //console.log(tokenLawyer);

        //storing in cookies

        res.cookie("lawyerlogintoken", tokenLawyer, {
          expires: new Date(Date.now() + 10 * 60000),
          httpOnly: true,
        });

        return res.status(200).json({ message: "Login" });
      } else {
        return res.status(422).json({ error: "Invalid cred pass" });
      }
    } else {
      return res.status(440).json({ error: "Invalid cred email" });
    }
  } catch (err) {
    console.log(err);
  }
});
route.post("/adminlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ error: "Fill all Inputs" });
    }
    const responce = await Admin.findOne({ email: email });
    if (responce) {
      const matching = await bcrypt.compare(password, responce.password);
      if (matching) {
        const tokenAdmin = await responce.generateAuthToken();
        //console.log(tokenAdmin);

        //storing in cookies

        res.cookie("adminlogintoken", tokenAdmin, {
          expires: new Date(Date.now() + 8 * 60000),
          httpOnly: true,
        });

        return res.status(200).json({ message: "Login" });
      } else {
        return res.status(422).json({ error: "Invalid cred pass" });
      }
    } else {
      return res.status(440).json({ error: "Invalid cred email" });
    }
  } catch (err) {
    console.log(err);
  }
});

//get barcards
route.get("/barcard/:email", (req, res) => {
  console.log("inside image getter");
  const userEmail = req.params.email;
  //console.log(__dirname);
  fs.readdir(path.join(__dirname, "..", "cards"), (err, files) => {
    if (err) {
      return res.status(500).send(err);
    }
    const userFiles = files.filter((file) => file.includes(userEmail));
    const fileAddresses = userFiles.map((file) =>
      path.join(__dirname, "..", "cards", file)
    );

    console.log(fileAddresses);
    res.send(fileAddresses);
  });
});

//messaging
route.post("/myMessageLawyer", authL, async (req, res) => {
  const { emailR, message } = req.body;
  const emailS = req.mylawyer.email;
  const me = await Client.findOne({ email: emailR });
  if (me) {
    const m = await me.addMessage(emailS, message);
    if (m) {
      res.status(200).json({ message: "Sent" });
    }
  } else {
    res.status(401).json({ error: "Client Not Available" });
  }
});
route.post("/myMessageClient", authC, async (req, res) => {
  const { emailR, message } = req.body;
  const emailS = req.myclient.email;
  const me = await Lawyer.findOne({ email: emailR });
  if (me) {
    const m = await me.addMessage(emailS, message);
    if (m) {
      res.status(200).json({ message: "Sent" });
    }
  } else {
    res.status(401).json({ error: "Lawyer Not Available" });
  }
});
route.get("/showMessageLawyer", authL, async (req, res) => {
  res.send(req.mylawyer.messages);
});
route.get("/showMessageClient", authC, async (req, res) => {
  res.send(req.myclient.messages);
});

//logouts
route.get("/logoutLawyer", (req, res) => {
  res.clearCookie("lawyerlogintoken", { path: "/" });
  res.status(201).json({ message: "Logout" });
});
route.get("/logoutClient", (req, res) => {
  res.clearCookie("clientlogintoken", { path: "/" });
  res.status(201).json({ message: "Logout" });
});
route.get("/logoutAdmin", (req, res) => {
  res.clearCookie("adminlogintoken", { path: "/" });
  res.status(201).json({ message: "Logout" });
});

//verifylawyer
route.post("/verifyLawyer", authA, async (req, res) => {
  try {
    const email = req.body.email;
    const data = await Lawyer.find();
    if (data) {
      data.map(async (val) => {
        if (email == val.email) {
          const speciLawyer = await Lawyer.findOne({ email: email });
          const message = await speciLawyer.addVerifyability();
          if (message) {
            res.status(201).json({ message: "Success" });
          }
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404);
  }
});

//offers
route.get("/propertyLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Property") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/criminalLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Criminal") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/rentLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Rent") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/divorceLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Divorce/Khula") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/childcustodyLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Child Custody") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/serviceLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Service") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/inheritanceLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Inheritance") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/womenrightLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Women Rights") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/labourLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Labour") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/constitutionalLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Constitutional") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/overseaseLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Oversease Services") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});
route.get("/legaldraftingLawyerOffer", async (req, res) => {
  try {
    const array = [];
    const data = await Lawyer.find();
    if (data) {
      data.map((val) => {
        if (val.specialities.speciality == "Legal Drafting") {
          array.push(val);
        }
        res.send(array);
      });
    }
  } catch (err) {
    return res.status(404).json({ error: err });
  }
});

//send payment
route.post("/sendEscrow", authC, async (req, res) => {
  const { emailR, payment } = req.body;
  const emailS = req.myclient.email;
  const adminres = await Admin.findOne({
    email: process.env.EMAILA,
  });
  const lawyeron = await Lawyer.findOne({ email: emailR });
  if (payment >= 0 && lawyeron) {
    const resp = await adminres.escrowpayment(emailS, emailR, payment);
    if (resp) {
      return res.status(201).json({ message: "Send to Escrow" });
    } else {
      return res.status(501).json({ error: "Internal Error" });
    }
  } else {
    return res.status(422).json({ error: "Finding Error" });
  }
});

//send to lawyer
route.post("/paymentLawyer", authC, async (req, res) => {
  try {
    let pay = 0;
    let myval = 0;
    const emailR = req.body.email;
    const emailS = req.myclient.email;
    const adminSir = await Admin.findOne({ email: process.env.EMAILA });
    adminSir.escrow.map((elem, index) => {
      if (elem.emaill == emailR && elem.emailc == emailS) {
        pay = elem.payment;
        //console.log(pay);
        myval = 2;
        return index;
      }
    });
    if (myval == 2) {
      const mylaw = await Lawyer.findOne({ email: emailR });
      const responce = await mylaw.addPayment(pay);
      const respo = await Admin.findOneAndUpdate(
        { email: process.env.EMAILA },
        {
          $pull: {
            escrow: { emailc: emailS, emaill: emailR },
          },
        }
      );
      if (respo && responce) {
        //console.log(respo);
        return res.status(201).json({ message: "Success" });
      }
    } else {
      return res
        .status(422)
        .json({ error: "Either email not correct or not in payment" });
    }
  } catch (err) {
    console.log(err);
  }
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "saadaziz0014@gmail.com",
    pass: process.env.MAILP,
  },
});

route.post("/reset-password", async (req, res) => {
  emailpass = req.body.email;
  const data = await OTP.findOneAndDelete({ emailpass });
  const code = Math.floor(Math.random() * 6000 + 1);
  const expire = new Date(Date.now() + 3 * 60000);
  const Otp = new OTP({ email: emailpass, code, expire });
  await Otp.save();
  const mailOptions = {
    from: "saadaziz0014@gmail.com", // Sender email address
    to: email, // Recipient email address
    subject: "Password Reset Request", // Email subject
    text: `Your OTP is ${code} and expires in ${expire}`, // Email body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      // Handle error
    } else {
      console.log("Email sent:", info.response);
      res.redirect("enter-otp");
    }
  });
  res.status(201).json({ message: "Send" });
});

route.post("/enter-otp", async (req, res) => {
  const code = req.body.otp;
  const otpemail = await OTP.findOne({ email: emailpass, code });
  const date = new Date(Date.now());
  if (otpemail) {
    if (otpemail.expire > date) {
      res.redirect("/change-password");
    } else {
      res.status(400).json({ error: "Time Exceeded" });
    }
  } else {
    res.status(400).json({ error: "otp not coorrect" });
  }
  res.status(201).json({ message: "Woho" });
});

route.post("/change-password", async (req, res) => {
  const pass = req.body.password;
  const datal = await Lawyer.findOne({ emailpass });
  if (datal) {
    datal.changePassword(pass);
  }
});

//submit proposal
route.post("/submitproposal", authL, async (req, res) => {
  try {
    const emaill = req.mylawyer.email;
    const message = req.body.message;
  } catch (err) {
    console.log(err);
  }
});

module.exports = route;
