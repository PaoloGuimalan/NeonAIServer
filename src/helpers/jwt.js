require("dotenv").config();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET;

const UserAccount = require("../schemas/useraccount");
const Devices = require("../schemas/devices");

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

const jwtssechecker = (req, res, next) => {
    const decodedToken = jwt.verify(req.params.ssetoken, JWT_SECRET)

    const token = decodedToken.token // token must consist email, userID, connectionType (if remote or device) and if device, add deviceID
    const type = decodedToken.type

    if(token){
        jwt.verify(token, JWT_SECRET, async (err, decode) => {
            if(err){
                console.log(err)
                res.sse(type, { status: false, auth: false, message: err.message })
            }
            else{
                const connectionType = decode.connectionType;
                if(connectionType == "remote"){
                    const userID = decode.userID;
                    const email = decode.email;

                    await UserAccount.find({ email: email, userID: userID }, { password: 0, _id: 0, __v: 0 }).then((result) => {
                        if(result.length){
                            const rawresult = createJwt({
                                ...result[0]._doc
                            });
                            req.params.token = {
                                type: "remote",
                                connectionID: userID,
                                info: rawresult
                            };
                            next()
                        }
                        else{
                            res.sse(type, {status: false, message: "Token not matched to any user!"})
                        }
                    }).catch((err) => {
                        console.log(err)
                        res.sse(type, {status: false, message: "Invalid user token!"})
                    })
                }
                else if(connectionType == "device"){
                    const deviceID = decode.deviceID;

                    await Devices.find({ deviceID: deviceID }).then((result) => {
                        if(result.length){
                            const rawresult = createJwt({
                                ...result[0]._doc
                            });
                            req.params.token = {
                                type: "device",
                                connectionID: deviceID,
                                info: rawresult
                            };
                            next()
                        }
                        else{
                            res.sse(type, {status: false, message: "Token not matched to any device!"})
                        }
                    }).catch((err) => {
                        console.log(err)
                        res.sse(type, {status: false, message: "Invalid device token!"})
                    })
                }
                else{
                    res.sse(type, {status: false, message: "Cannot determine connection signature!"})
                }
            }
        })
    }
    else{
        res.send(type, { status: false, auth: false, message: "Cannot verify user!"})
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
    jwtdecode,
    jwtssechecker
}