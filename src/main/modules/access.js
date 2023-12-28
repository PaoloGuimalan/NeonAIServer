const express = require("express")
const router = express.Router()
const mongoose =  require("mongoose");
const jwt = require("jsonwebtoken");
const sse = require("sse-express");
const { jwtverifier, jwtssechecker, jwtdecode, createJwt } = require("../../helpers/jwt");
const { insertNewSession, clearASingleSession } = require("../../helpers/ssehandler");
const { makeid, dateGetter, timeGetter } = require("../../helpers/generators");

const Devices = require("../../schemas/devices");
const { checkDeviceIDExisting } = require("../../helpers/reusables");

router.get('/', jwtverifier, (req, res) => {
    const jwtID = req.params.jwtID;

    res.send({ status: true, result: jwtID })
})

router.get('/ssehandshake/:ssetoken', [sse, jwtssechecker], async (req, res) => {
    const tokenfromsse = req.params.token;
    const sessionstamp = `SESSION_STAMP_${makeid(15)}`

    insertNewSession(tokenfromsse, sessionstamp, res).then(() => {
        // handle sse actions to notify other connections
    })

    req.on('close', () => {
        clearASingleSession(tokenfromsse, sessionstamp);
        console.log("Session Closed!")
    })
})

router.post('/adddevice', jwtverifier, async (req, res) => {
    const payload = req.body.token;
    const userInfo = req.params.token;
    
    try{
        const decodedpayload = jwtdecode(payload);
        const decodedUserInfo = jwtdecode(userInfo);

        const deviceID = await checkDeviceIDExisting(`DVC_${makeid(20)}`);

        // token must consist email, userID, connectionType (if remote or device) and if device, add deviceID
        const connectionTokenraw = {
            email: decodedUserInfo.email,
            userID: decodedUserInfo.userID,
            connectionType: "device",
            deviceID: deviceID
        }

        const connectionTokenValue = createJwt(connectionTokenraw);

        const connectionTokenForTokenize = {
            token: connectionTokenValue
        }

        const connectionToken = createJwt(connectionTokenForTokenize);

        const newdevicedata = {
            deviceID: deviceID,
            deviceName: decodedpayload.deviceName,
            userID: decodedUserInfo.userID,
            type: decodedpayload.deviceType, //mobile, pc, embedded devices
            os: decodedpayload.os,
            connectionToken: connectionToken, //token will be used for sseconnection 
            dateAdded: {
                date: dateGetter(),
                time: timeGetter()
            },
            isActivated: true,
            isMounted: false
        }

        const newDevice = new Devices(newdevicedata);

        newDevice.save().then(() => {
            // execute sse triggers
            res.send({ status: true, message: "Device has been added" })
        }).catch((err) => {
            console.log(err);
            res.send({status: false, message: "Error adding device!"});
        });

        // console.log(newdevicedata);
    }
    catch(ex){
        console.log(ex);
        res.send({ status: false, message: "Token Request was corrupted!" })
    }
})

module.exports = router;