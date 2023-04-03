const jwt = require("jsonwebtoken");
const Client = require("../models/clientModel");
const authC = async (req, res, next) => {
    try {
        const token = req.cookies.clientlogintoken;
        //console.log(token);
        const verify = jwt.verify(token, process.env.SECRETC);

        const myclient = await Client.findOne({
            _id: verify._id,
            "tokens.token": token,
        });

        if (!myclient) {
            throw new Error("Unauthorized");
        }

        req.token = token;
        req.myclient = myclient;
        req.id = myclient._id;
        next();
    } catch (err) {
        res.status(401).send({ error: "un" });
        console.log(err);
    }
};

module.exports = authC;
