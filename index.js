const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const mysql = require("mysql");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
const socketIO = require("socket.io");

const Authentication = require('./src/main/auth/auth')
const Access = require('./src/main/modules/access')

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
}))

app.use('/auth', Authentication)
app.use('/access', Access)

app.listen(PORT, () => {
    console.log(`Server running at Port ${PORT}`);
})