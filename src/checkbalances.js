require('dotenv').config()
const {
    lunaEndpoints,
    lunaChainIds,
    getBalances,
    initializeLunaDaemon
} = require('./lunamethods')

const main = async () => {
    const lunaEndpointUrl = lunaEndpoints[process.env.LUNA_ENDPOINT_LOCATION]
    if (!lunaEndpointUrl) {
        throw Error('Invalid LUNA_ENDPOINT_LOCATION')
    }
    const lunaChainId = lunaChainIds[process.env.LUNA_CHAIN_TYPE]
    if (!lunaEndpointUrl) {
        throw Error('Invalid LUNA_ENDPOINT_LOCATION')
    }
    const startTime = Date.now()
    console.log('============= Testing Luna =================')
    const localPublicAddress = process.env.LOCAL_PUBLIC_ADDRESS
    const remotePublicAddress = process.env.REMOTE_PUBILC_ADDRESS
    const lunaDaemon = initializeLunaDaemon(lunaEndpointUrl, lunaChainId)
    console.log('\n')
    console.log('============= Starting balances =================')
    await getBalances(lunaDaemon, localPublicAddress)
    await getBalances(lunaDaemon, remotePublicAddress)
    console.log('\n')
}

main()
