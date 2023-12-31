const sse = require("sse-express");
const { createJwt } = require("./jwt");

let sseNotificationsWaiters = Object.create(null);

const insertNewSession = async (tokenfromsse, sessionstamp, res) => {
    const connectionID = await tokenfromsse.connectionID;
    const connectionType = await tokenfromsse.type;
    const ifexistingsession = await sseNotificationsWaiters[connectionID];

    if(ifexistingsession){
        if(connectionType == "remote"){
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
    sseNotificationsWaiters = Object.create(null);
}

const flushToSingleID = (type, connectionID, result) => {
    const connectionResponse = sseNotificationsWaiters[connectionID];
    const encodedResult = createJwt({
        data: result
    });

    if(connectionResponse){
        connectionResponse.response.map((mp) => {
            mp.res.sse(type, {
                status: true,
                listener: type,
                result: encodedResult
            })
        })
    }
}

module.exports = {
    sseNotificationsWaiters,
    insertNewSession,
    clearASingleSession,
    clearAllSession,
    flushToSingleID
}