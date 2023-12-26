const UserVerification = require("../schemas/userverification");
const UserAccount = require("../schemas/useraccount");
const { createJwt } = require("./jwt");

const checkVerIDExisting = async (IDMade) => {
    return await UserVerification.find({verID: IDMade}).then((result) => {
        if(result.length){
            checkVerIDExisting(makeID(20))
        }
        else{
            return IDMade;
        }
    }).catch((err) => {
        console.log(err)
        return false;
    })
}

const getUserInfo = async (email, password) => {
    return await UserAccount.find({ email: email, password: password }, { password: 0, _id: 0 }).then((result) => {
        if(result.length){
            const rawresult = createJwt({
                ...result[0]._doc
            });
            return rawresult
        }
        else{
            return false;
        }
    }).catch((err) => {
        throw new Error(err);
    })
}

const getUserInfoByUserID = async (userID) => {
    return await UserAccount.find({ userID: userID }, { password: 0, _id: 0 }).then((result) => {
        if(result.length){
            const rawresult = createJwt({
                ...result[0]._doc
            });
            return rawresult
        }
        else{
            return false;
        }
    }).catch((err) => {
        throw new Error(err);
    })
}

const changeAccountVerificationStatus = async (userID, newStatus) => {
    return await UserAccount.updateOne({ userID: userID }, { isVerified: newStatus }).then((result) => {
        if(result.modifiedCount){
            return true;
        }
        else{
            return false;
        }
    }).catch((err) => {
        throw new Error(err);
    })
}

module.exports = {
    checkVerIDExisting,
    getUserInfo,
    getUserInfoByUserID,
    changeAccountVerificationStatus
}