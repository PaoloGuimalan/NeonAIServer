const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const { createJwt, jwtdecode } = require("../../helpers/jwt");
const { makeid, dateGetter, timeGetter } = require("../../helpers/generators");

const UserAccount = require("../../schemas/useraccount");

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

router.post('/register', async (req, res) => {
    const rawpayload = req.body.token;
    
    try{
        const decodedpayload = jwtdecode(rawpayload);

        const email = decodedpayload.email;

        const newAccount = new UserAccount({
            ...decodedpayload,
            userID: await checkUserIDExisting(`USR_${makeid(5)}_${makeid(10)}`),
            profile: "",
            dateCreated: {
                date: dateGetter(),
                time: timeGetter()
            },
            isActivated: true,
            isVerified: false
        })

        if(await checkEmailExisting(email)){
            res.send({status: false, message: "Email already in use"});
        }
        else{
            newAccount.save().then(() => {
                // sendEmailVerCode("ChatterLoop", email, "Verification Code", userID)
                res.send({status: true, message: "You have been registered"})
            }).catch((err) => {
                console.log(err);
                res.send({status: false, message: "Error registering account!"});
            });
        }
    }
    catch(ex){
        console.log(ex);
        res.send({states: false, message: "Tokenized payload invalid!"})
    }
})

module.exports = router;