require('dotenv').config()
const {
    lunaEndpoints,
    lunaChainIds,
    sendLuna,
    initializeLunaDaemon,
    createLunaWalletFromMnemonic,
    createLunaWalletFromKey,
} = require('./lunamethods')

const loadLunaDaemon = () => {
    const lunaEndpointUrl = lunaEndpoints[process.env.LUNA_ENDPOINT_LOCATION]
    if (!lunaEndpointUrl) {
        throw Error('Invalid LUNA_ENDPOINT_LOCATION')
    }
    const lunaChainId = lunaChainIds[process.env.LUNA_CHAIN_TYPE]
    if (!lunaEndpointUrl) {
        throw Error('Invalid LUNA_ENDPOINT_LOCATION')
    }
    console.log('============= Loading Daemon =================')
    const lunaDaemon = initializeLunaDaemon(lunaEndpointUrl, lunaChainId)
    return lunaDaemon
}

const loadWallet = async (lunaDaemon) => {
    const walletMnemonic = process.env.MNEMONIC
    const walletRawKey = process.env.RAW_KEY
    if (!walletMnemonic && !walletRawKey) {
        throw Error('Must provide either MNEMONIC or RAW_KEY in your .env file')
    }
    let senderWallet = null
    if (walletMnemonic) {    
        senderWallet = await createLunaWalletFromMnemonic(lunaDaemon, walletMnemonic)
    } else if (walletRawKey) {
        senderWallet = await createLunaWalletFromKey(lunaDaemon, walletRawKey)
    }
    return senderWallet
}

const startSpendLoop = async (lunaDaemon, senderWallet) => {
    const remotePublicAddress = process.env.REMOTE_PUBILC_ADDRESS
    const lunaSpendAmount = parseFloat(process.env.SPEND_AMOUNT)

    console.log('---------- Time sensitive method ----------')
    console.log(' Executing time sensitive method');
    console.log(` End time: ${new Date().toLocaleString()}`);

    let attemptNumber = 0
    const maxAttemps = 1 // 50 // about 30 seconds
    const intervalTimerId = setInterval(async () => {
        console.log(`---- Attempt number: ${attemptNumber} ----`)
        await sendLuna(lunaDaemon, senderWallet, remotePublicAddress, lunaSpendAmount)
        attemptNumber += 1
        if (attemptNumber >= maxAttemps) {
            clearInterval(intervalTimerId)
            console.log('=========== Done trying ===========')
        }
    }, 200)
    console.log('\n')
}

// every 1 ms interval, check if the current time is greater than executionTime
// if so, execute the callback function
// if not, do nothing
const executeMethodAtSpecificTime = (executionDateTime, lunaDaemon, senderWallet) => {
    const oneSecond = 1000
    const oneMinute = oneSecond * 60
    const oneHour = oneMinute * 60
    const startTime = Date.now()
    console.log('\n')
    console.log('=========== Waiting for time ===========')
    console.log(` End time:   ${new Date(executionDateTime).toLocaleString()}`)
    console.log(` Start time: ${new Date(startTime).toLocaleString()}`)
    let logIntervalMs = 1000
    const intervalTimeoutMs = 1000
    const executionTime = new Date(executionDateTime)
    const lastLoggedTime = new Date()
    const intervalTimerId = setInterval(() => {
        const currentTime = new Date()
        const timeSinceLastLog = currentTime - lastLoggedTime
        const timeUntilExecution = executionTime - currentTime
        const timeSinceStart = currentTime - startTime
        if (timeSinceLastLog > logIntervalMs) {
            if (timeSinceStart <= oneMinute || timeUntilExecution <= oneMinute) {
                logIntervalMs = oneSecond
            } else if (timeSinceStart <= oneHour || timeUntilExecution <= oneHour) {
                logIntervalMs = oneMinute
            } else {
                logIntervalMs = oneHour
            }
            console.log(` Time since start: ${Math.round(timeSinceStart / 1000)} seconds`)
            lastLoggedTime.setTime(currentTime.getTime())
        }
        if (currentTime >= executionTime) {
            clearInterval(intervalTimerId)
            startSpendLoop(lunaDaemon, senderWallet)
            console.log('=========== Done ===========')
        }
    }, intervalTimeoutMs)
}

const main = async () => {
    // const now = new Date().getTime()
    const executionTime = parseInt(process.env.EXECUTION_TIMESTAMP) * 1000
    if (isNaN(executionTime)) {
        throw Error('Must provide an EXECUTION_TIME unix timestamp in the .env file')
    }
    const lunaDaemon = loadLunaDaemon()
    const senderWallet = await loadWallet(lunaDaemon)
    executeMethodAtSpecificTime(executionTime, lunaDaemon, senderWallet)
}

main()