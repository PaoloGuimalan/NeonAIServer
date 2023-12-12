const express = require("express")
const router = express.Router()
const mongoose =  require("mongoose");
const jwt = require("jsonwebtoken");
const { jwtverifier } = require("../../helpers/jwt");

router.get('/', jwtverifier, (req, res) => {
    const jwtID = req.params.jwtID;

    res.send({ status: true, result: jwtID })
})

module.exports = router;