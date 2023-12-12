const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const { createJwt } = require("../../helpers/jwt");
const { makeid, dateGetter } = require("../../helpers/generators");

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

module.exports = router;