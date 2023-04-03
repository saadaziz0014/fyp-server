const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const authA = async (req, res, next) => {
    try {
        const token = req.cookies.adminlogintoken;
        //console.log(token);
        const verify = jwt.verify(token, process.env.SECRETA);

        const myadmin = await Admin.findOne({
            _id: verify._id,
            "tokens.token": token,
        });

        if (!myadmin) {
            throw new Error("Unauthorized");
        }

        req.token = token;
        req.myadmin = myadmin;
        req.id = myadmin._id;
        next();
    } catch (err) {
        res.status(401).send({ error: "un" });
        console.log(err);
    }
};

module.exports = authA;
