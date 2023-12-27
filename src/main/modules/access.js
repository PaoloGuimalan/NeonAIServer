const express = require("express")
const router = express.Router()
const mongoose =  require("mongoose");
const jwt = require("jsonwebtoken");
const sse = require("sse-express");
const { jwtverifier, jwtssechecker } = require("../../helpers/jwt");
const { insertNewSession, clearASingleSession } = require("../../helpers/ssehandler");
const { makeid } = require("../../helpers/generators");

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

module.exports = router;