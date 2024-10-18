const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const sse = require("sse-express");
const {
  jwtverifier,
  jwtssechecker,
  jwtdecode,
  createJwt,
} = require("../../helpers/jwt");
const {
  insertNewSession,
  clearASingleSession,
  flushToSingleID,
} = require("../../helpers/ssehandler");
const { makeid, dateGetter, timeGetter } = require("../../helpers/generators");

const Devices = require("../../schemas/devices");
const { checkDeviceIDExisting } = require("../../helpers/reusables");
const { FLUSH_TO_SINGLE_ID } = require("../../helpers/vars/rabbitmq-events");

router.get("/", jwtverifier, (req, res) => {
  const jwtID = req.params.jwtID;

  res.send({ status: true, result: jwtID });
});

router.post("/devicefileslistresponse", async (req, res) => {
  const data = req.body.token;

  try {
    const parsedData = JSON.parse(data);
    const connectionID = parsedData.toID;

    flushToSingleID("devicefileslist", connectionID, parsedData);

    await producer.publishMessage("INFO:NEONREMOTE", FLUSH_TO_SINGLE_ID, {
      parameters: {
        type: "devicefileslist",
        userID: connectionID,
        result: parsedData,
      },
    });

    res.send({ status: true, message: "OK" });
  } catch (ex) {
    console.log(ex);
    res.send({ status: false, message: "Error parsing data" });
  }
});

router.post("/relayfile", async (req, res) => {
  const data = req.body.token;

  try {
    const parsedData = JSON.parse(data);
    const connectionID = parsedData.toID;

    flushToSingleID("fetch_file_response", connectionID, parsedData);

    await producer.publishMessage("INFO:NEONREMOTE", FLUSH_TO_SINGLE_ID, {
      parameters: {
        type: "fetch_file_response",
        userID: connectionID,
        result: parsedData,
      },
    });

    res.send({ status: true, message: "OK" });
  } catch (ex) {
    console.log(ex);
    res.send({ status: false, message: "Error parsing data" });
  }
});

router.post("/devicesystemlogsrelay", async (req, res) => {
  const data = req.body.token;

  try {
    const parsedData = JSON.parse(data);
    const connectionID = parsedData.toID;

    flushToSingleID("devicesystemlogs", connectionID, parsedData);

    await producer.publishMessage("INFO:NEONREMOTE", FLUSH_TO_SINGLE_ID, {
      parameters: {
        type: "devicefileslist",
        userID: connectionID,
        result: parsedData,
      },
    });

    res.send({ status: true, message: "OK" });
  } catch (ex) {
    console.log(ex);
    res.send({ status: false, message: "Error parsing data" });
  }
});

module.exports = router;

