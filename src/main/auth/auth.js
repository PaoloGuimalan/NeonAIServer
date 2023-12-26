const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const { createJwt, jwtdecode } = require("../../helpers/jwt");
const { makeid, dateGetter, timeGetter } = require("../../helpers/generators");

const UserAccount = require("../../schemas/useraccount");
const { sendEmailVerCode } = require("../../helpers/requests");
const { getUserInfo } = require("../../helpers/reusables");

router.get('/', (req, res) => {
    res.send("Neon AI Authentication")
})

router.post('/createtoken', (req, res) => {
    const createdToken = createJwt({
        id: makeid(15),
        date: dateGetter()
    })

    res.send({
        status: true,
        result: createdToken
    })
})

const checkUserIDExisting = async (nameID) => {
    const combineID = nameID;

    return await UserAccount.find({userID: combineID}).then((result) => {
        if(result.length){
            checkUserIDExisting(`USR_${makeid(5)}_${makeid(10)}`)
        }
        else{
            return combineID;
        }
    }).catch((err) => {
        console.log(err)
        return false;
    })
}

const checkEmailExisting = async (email) => {
    return await UserAccount.find({email: email}).then((result) => {
        if(result.length){
           return true
        }
        else{
            return false;
        }
    }).catch((err) => {
        console.log(err)
        return false;
    })
}

router.post('/refreshauth', (req, res) => {
    const rawpayload = req.body.token;

    try{
        const decodedpayload = jwtdecode(rawpayload);

        const userID = decodedpayload.userID;
        const email = decodedpayload.email;

        UserAccount.find({ email: email, userID: userID }, { password: 0, _id: 0, __v: 0 }).then((result) => {
            if(result.length){
                const rawresult = createJwt({
                    ...result[0]._doc
                });
                res.send({status: true, result: rawresult});
            }
            else{
                res.send({status: false, message: "Token not matched to any user!"})
            }
        }).catch((err) => {
            console.log(err)
            res.send({status: false, message: "Invalid user token!"})
        })
    }
    catch(ex){
        console.log(ex);
        res.send({status: false, message: "Tokenized payload invalid!"})
    }
})

router.post('/login', (req, res) => {
    const rawpayload = req.body.token;

    try{
        const decodedpayload = jwtdecode(rawpayload);

        const password = decodedpayload.password;
        const email = decodedpayload.email;

        UserAccount.find({ email: email, password: password }, { password: 0, _id: 0 }).then((result) => {
            if(result.length){
                const rawresult = createJwt({
                    ...result[0]._doc
                });
                res.send({status: true, result: rawresult});
            }
            else{
                res.send({status: false, message: "Token not matched to any user!"})
            }
        }).catch((err) => {
            console.log(err)
            res.send({status: false, message: "Invalid user token!"})
        })
    }
    catch(ex){
        console.log(ex);
        res.send({status: false, message: "Tokenized payload invalid!"})
    }
})

router.post('/register', async (req, res) => {
    const rawpayload = req.body.token;
    
    try{
        const decodedpayload = jwtdecode(rawpayload);

        const email = decodedpayload.email;
        const password = decodedpayload.password;
        const userID = await checkUserIDExisting(`USR_${makeid(5)}_${makeid(10)}`);

        const payload = {
            ...decodedpayload,
            userID: userID,
            profile: "",
            dateCreated: {
                date: dateGetter(),
                time: timeGetter()
            },
            isActivated: true,
            isVerified: false
        }

        const newAccount = new UserAccount(payload);

        if(await checkEmailExisting(email)){
            res.send({status: false, message: "Email already in use"});
        }
        else{
            newAccount.save().then(() => {
                getUserInfo(email, password).then((info) => {
                    sendEmailVerCode("ChatterLoop", email, "Verification Code", userID)
                    res.send({status: true, message: "You have been registered", result: info})
                }).catch((err) => {
                    console.log(err);
                    res.send({status: false, message: "Error fetching account information"})
                })
            }).catch((err) => {
                console.log(err);
                res.send({status: false, message: "Error registering account!"});
            });
        }
    }
    catch(ex){
        console.log(ex);
        res.send({status: false, message: "Tokenized payload invalid!"})
    }
})

module.exports = router;