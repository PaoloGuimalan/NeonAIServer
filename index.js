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
const Device = require('./src/main/modules/device')

const MongooseConnection = require("./src/connections/index")

const connectMongo = async () => {
    return mongoose.connect(MongooseConnection.url, MongooseConnection.params)
}

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
app.use('/device', Device)

app.listen(PORT, () => {
    console.log(`Server running at Port ${PORT}`);
    connectMongo().then(() => {
        console.log(`Connected to MongoDB`)
    }).catch((err) => {
        console.log(err)
    })
})