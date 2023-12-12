require("dotenv").config();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET;

const jwtverifier = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if(token && token != ""){
        jwt.verify(token, JWT_SECRET, (err, decode) => {
            if(err){
                res.send({
                    status: false,
                    message: "Token Error!"
                })
            }
            else{
                const id = decode;

                req.params.jwtID = id;
                next()
            }
        })
    }
    else{
        res.send({
            status: false,
            message: "No Token!"
        })
    }
}

const createJwt = (data) => {
    const token = jwt.sign(data, JWT_SECRET)

    return token;
}

module.exports = {
    jwtverifier,
    createJwt
}