const express = require("express")
const router = express.Router()
const mongoose =  require("mongoose");
const jwt = require("jsonwebtoken");
const sse = require("sse-express");
const { jwtverifier, jwtssechecker, jwtdecode, createJwt } = require("../../helpers/jwt");
const { insertNewSession, clearASingleSession, flushToSingleID } = require("../../helpers/ssehandler");
const { makeid, dateGetter, timeGetter } = require("../../helpers/generators");

const Devices = require("../../schemas/devices");
const { checkDeviceIDExisting } = require("../../helpers/reusables");

router.get('/', jwtverifier, (req, res) => {
    const jwtID = req.params.jwtID;

    res.send({ status: true, result: jwtID })
})

router.post('/devicefileslistresponse', (req, res) => {
    const data = req.body.token;
    
    try{
        const parsedData = JSON.parse(data);
        const connectionID = parsedData.toID;
        
        flushToSingleID('devicefileslist', connectionID, parsedData);

        res.send({ status: true, message: "OK" })
    }
    catch(ex){
        console.log(ex);
        res.send({ status: false, message: "Error parsing data" })
    }
})

module.exports = router;