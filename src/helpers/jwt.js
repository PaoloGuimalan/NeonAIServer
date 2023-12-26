require("dotenv").config();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET;

const UserAccount = require("../schemas/useraccount");

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
                const userID = decode.userID;
                const email = decode.email;

                UserAccount.find({ email: email, userID: userID }, { password: 0, _id: 0, __v: 0 }).then((result) => {
                    if(result.length){
                        const rawresult = createJwt({
                            ...result[0]._doc
                        });
                        req.params.token = rawresult;
                        next()
                    }
                    else{
                        res.send({status: false, message: "Token not matched to any user!"})
                    }
                }).catch((err) => {
                    console.log(err)
                    res.send({status: false, message: "Invalid user token!"})
                })
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

const jwtdecode = (data) => {
    return jwt.verify(data, JWT_SECRET, (err, decode) => {
        if(err){
            return false;
        }
        else{
            const id = decode;
            return id;
        }
    })
}

module.exports = {
    jwtverifier,
    createJwt,
    jwtdecode
}