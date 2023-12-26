require("dotenv").config()
const Axios = require("axios")

const UserVerification = require("../schemas/userverification");
const { checkVerIDExisting } = require("./reusables");
const { makeid, dateGetter, timeGetter } = require("./generators");

const MAILINGSERVICE_DOMAIN = process.env.MAILINGSERVICE

const sendEmailVerCode = async (from, to, subject, userID) => {
    const generatedID = makeid(6)
    const content = `
    Welcome to Neon Remote!

    Your registration was successful! Here is your verification code for the account activation: ${generatedID}
    `;

    const newVerID = await checkVerIDExisting(makeid(20))

    const newVerRecord = new UserVerification({
        verID: newVerID,
        userID: userID,
        verCode: generatedID,
        dateGenerated: {
            date: dateGetter(),
            time: timeGetter()
        },
        isUsed: false
    })

    Axios.post(`${MAILINGSERVICE_DOMAIN}/sendEmail`, {
        from: from,
        email: to,
        subject: subject,
        content: content
    }).then((response) => {
        if(response.data.status){
            //action needed to save verification code in db
            newVerRecord.save().then(() => {

            }).catch((err) => {
                console.log(err)
            })
        }
    }).catch((err) => {
        console.log(err)
    })
}

module.exports = {
    sendEmailVerCode
}