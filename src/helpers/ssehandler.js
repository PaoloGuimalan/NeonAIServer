const sse = require("sse-express");

let sseNotificationsWaiters = Object.create(null);

const insertNewSession = async (tokenfromsse, sessionstamp, res) => {
    const connectionID = await tokenfromsse.connectionID;
    const connectionType = await tokenfromsse.type;
    const ifexistingsession = await sseNotificationsWaiters[connectionID];

    if(ifexistingsession){
        sseNotificationsWaiters[connectionID] = {
            response: [
                ...ifexistingsession.response,
                {
                    type: connectionType,
                    sessionstamp: sessionstamp,
                    res: res
                }
            ]
        }

        return true;
    }
    else{
        sseNotificationsWaiters[connectionID] = {
            response: [
                {
                    type: connectionType,
                    sessionstamp: sessionstamp,
                    res: res
                }
            ]
        }

        return true;
    }
}

const clearASingleSession = (tokenfromsse, sessionstamp) => {
    const connectionID = tokenfromsse.connectionID;
    const ifexistingsession = sseNotificationsWaiters[connectionID];

    if(ifexistingsession){
        const minusmutatesession = ifexistingsession.response.filter((flt) => flt.sessionstamp != sessionstamp);
        
        if(minusmutatesession.length > 0){
            sseNotificationsWaiters[connectionID] = {
                response: minusmutatesession
            }
        }
        else{
            delete sseNotificationsWaiters[connectionID];
        }
    }
}

const clearAllSession = () => {

}

module.exports = {
    sseNotificationsWaiters,
    insertNewSession,
    clearASingleSession,
    clearAllSession
}