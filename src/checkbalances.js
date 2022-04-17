const {
    getBalances,
    sendLuna,
    initializeLunaDaemon,
    createLunaWallet,
} = require('./lunamethods')

const main = async () => {
    const startTime = Date.now()
    console.log('============= Testing Luna =================')
    const localPublicAddress = process.env.LOCAL_PUBLIC_ADDRESS
    const remotePublicAddress = process.env.REMOTE_PUBILC_ADDRESS
    const lunaSpendAmount = parseFloat(process.env.SPEND_AMOUNT)
    const lunaDaemon = initializeLunaDaemon()
    const senderWallet = await createLunaWallet(lunaDaemon)
    console.log('\n')
    console.log('============= Starting balances =================')
    await getBalances(lunaDaemon, localPublicAddress)
    await getBalances(lunaDaemon, remotePublicAddress)
    console.log('\n')
}

main()
