const {
    getBalances,
    sendLuna,
    initializeLunaDaemon,
    createLunaWallet,
} = require('./lunamethods')

const runTransactions = async () => {
    console.log('============= Testing Luna =================')
    const localPublicAddress = process.env.LOCAL_PUBLIC_ADDRESS
    const remotePublicAddress = process.env.REMOTE_PUBILC_ADDRESS
    const lunaSpendAmount = parseFloat(process.env.SPEND_AMOUNT)
    const lunaDaemon = initializeLunaDaemon()
    const senderWallet = await createLunaWallet(lunaDaemon)
    let i = 0
    const eventTimerId = setInterval(async () => {
        console.log(`---- index: ${i} ----`)
        await sendLuna(lunaDaemon, senderWallet, remotePublicAddress, lunaSpendAmount)
        i += 1
    }, 200)
    console.log('\n')
}


runTransactions()