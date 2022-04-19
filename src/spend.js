require('dotenv').config()
const {
    lunaEndpoints,
    lunaChainIds,
    sendLuna,
    initializeLunaDaemon,
    createLunaWalletFromMnemonic,
    createLunaWalletFromKey,
} = require('./lunamethods')

const runTransactions = async () => {
    const lunaEndpointUrl = lunaEndpoints[process.env.LUNA_ENDPOINT_LOCATION]
    if (!lunaEndpointUrl) {
        throw Error('Invalid LUNA_ENDPOINT_LOCATION')
    }
    const lunaChainId = lunaChainIds[process.env.LUNA_CHAIN_TYPE]
    if (!lunaEndpointUrl) {
        throw Error('Invalid LUNA_ENDPOINT_LOCATION')
    }
    const walletMnemonic = process.env.MNEMONIC
    const walletRawKey = process.env.RAW_KEY
    if (!walletMnemonic && !walletRawKey) {
        throw Error('Must provide either MNEMONIC or RAW_KEY in your .env file')
    }
    console.log('============= Testing Luna =================')
    const recipientAddress = process.env.RECIPIENT_PUBLIC_ADDRESS
    const lunaSpendAmount = parseFloat(process.env.SPEND_AMOUNT)
    const lunaDaemon = initializeLunaDaemon(lunaEndpointUrl, lunaChainId)
    let senderWallet = null
    if (walletMnemonic) {    
        senderWallet = await createLunaWalletFromMnemonic(lunaDaemon, walletMnemonic)
    } else if (walletRawKey) {
        senderWallet = await createLunaWalletFromKey(lunaDaemon, walletRawKey)
    }
    let i = 0
    setInterval(async () => {
        console.log(`---- index: ${i} ----`)
        await sendLuna(lunaDaemon, senderWallet, recipientAddress, lunaSpendAmount, i)
        i += 1
    }, 200)
    console.log('\n')
}

runTransactions()
