const mongoose = require("mongoose")

const devices = mongoose.Schema({
    deviceID: {type: mongoose.Schema.Types.Mixed, require: true},
    userID: {type: mongoose.Schema.Types.Mixed, require: true},
    type: {type: mongoose.Schema.Types.Mixed, require: true},
    dateAdded: {
        date: {type: mongoose.Schema.Types.Mixed, require: true},
        time: {type: mongoose.Schema.Types.Mixed, require: true}
    },
    isActivated: Boolean
})

module.exports = mongoose.model("Devices", devices, "devices");