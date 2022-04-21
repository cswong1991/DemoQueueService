const defaultConfigs = {
    // throw error if exceed capacity
    maxCapacity: 10000,
    // pass all requests if less than this number
    minCapacity: 100,

    // redirect to this url after digested
    callbackURL: null,
    // pass x requests each interval
    digestItems: 10,
    // pass requests every x seconds
    digestInterval: 10,
    // remove items from queue every x seconds
    autoClearInterval: 300,

    // remove request from queue if exceed timeout
    timeoutInQueue: 300,
    // remove request from finish queue if exceed timeout
    timeoutFinishQueue: 300
}

module.exports = defaultConfigs;