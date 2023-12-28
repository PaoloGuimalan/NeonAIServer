const mongoose = require("mongoose")

const devices = mongoose.Schema({
    deviceID: {type: mongoose.Schema.Types.Mixed, require: true},
    deviceName: {type: mongoose.Schema.Types.Mixed, require: true},
    userID: {type: mongoose.Schema.Types.Mixed, require: true},
    type: {type: mongoose.Schema.Types.Mixed, require: true}, //mobile, pc, embedded devices
    os: {type: mongoose.Schema.Types.Mixed, require: true},
    connectionToken: {type: mongoose.Schema.Types.Mixed, require: true}, //token will be used for sseconnection
    dateAdded: {
        date: {type: mongoose.Schema.Types.Mixed, require: true},
        time: {type: mongoose.Schema.Types.Mixed, require: true}
    },
    isActivated: Boolean,
    isMounted: Boolean //if device has had its first connection to sse will be label as mounted
})

module.exports = mongoose.model("Devices", devices, "devices");