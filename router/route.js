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
route.post("/myMessageClient", async (req, res) => {
  const { emailS, emailR, message } = req.body;
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

module.exports = route;