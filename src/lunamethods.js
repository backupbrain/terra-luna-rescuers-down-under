const fetch = require('isomorphic-fetch')
const { MsgSend, MnemonicKey, Coins, LCDClient, RawKey } = require('@terra-money/terra.js')

const lunaEndpoints = {
    'de': 'https://terra-lcd.easy2stake.com',
    'us': 'https://blockdaemon-terra-lcd.api.bdnodes.net:1317'
}

const lunaChainIds = {
    'main': 'columbus-5',
    'test': 'bombay-12'
}

const getGasPriceCoins = async () => {
    // Fetch gas prices and convert to `Coin` format.
    const gasPricesResponse = await fetch('https://bombay-fcd.terra.dev/v1/txs/gas_prices')
    const gasPricesJson = await gasPricesResponse.json();
    const gasPricesCoins = new Coins(gasPricesJson);
    return gasPricesCoins
}

const initializeLunaDaemon = (endpointUrl, chainId) => {
    console.log('Initializing luna daemon')
    console.log(`  Endpoint URL: ${endpointUrl}`)
    console.log(`  Chain ID: ${chainId}`)
    // const gasPricesCoins = getGasPriceCoins();
    const lunaDaemon = new LCDClient({
        URL: endpointUrl,
        // URL: 'https://blockdaemon-terra-lcd.api.bdnodes.net:1317',
        chainID: chainId,
        gasPrices: { uluna: 0.025 }, // gasPricesCoins,
        gasAdjustment: "1.4"
        // gas: 10000000,
    });
    return lunaDaemon
}

const createLunaWalletFromMnemonic = async (lunaDaemon, mnemonic) => {
    console.log(`Creating new wallet`)
    const mnemonicKey = new MnemonicKey({
        mnemonic
    });
    const wallet = lunaDaemon.wallet(mnemonicKey);
    return wallet
}

const getKeyBytesFromRawKey = (rawKey) => {
    const keyBytes = new Uint8Array(Buffer.from(rawKey, 'hex'))
    return keyBytes
}

const createLunaWalletFromKey = async (lunaDaemon, keyString) => {
    const keyBytes = getKeyBytesFromRawKey(keyString)
    const privateKey = new RawKey(keyBytes)
    const wallet = lunaDaemon.wallet(privateKey);
    return wallet
}


const getBalances = async (lunaDaemon, address) => {
    console.log(`Getting balances for ${address}`)
    if (address) {
        const [balance] = await lunaDaemon.bank.balance(address);
        const balances = balance.toData()
        console.log(`  Balances:`)
        console.log({ balances })
        return balances
    }
}


const sendLuna = async (lunaDaemon, wallet, toAddress, amount, index) => {
    console.log(`Sending ${amount} to ${toAddress}`)
    const uLunaAmount = `${amount * 1000000}`
    console.log(`  uLunaAmount: ${uLunaAmount}, typeof: ${typeof uLunaAmount}`)
    console.log(`  Converting to uLuna: ${uLunaAmount}`)
    console.log(`  Creating new MsgSend for index ${index}:`)
    const msgSend = new MsgSend(
        wallet.key.accAddress,
        toAddress,
        { uluna: uLunaAmount }
    );
    console.log(`Created MsgSend for Index ${index}: ${JSON.stringify(msgSend, null, 2)}`)
    console.log(`  Creating new transaction:`)
    let transaction;
    try {
        transaction = await wallet.createAndSignTx({ msgs: [msgSend] });
    } catch (error) {
        console.log(`  Error creating transaction for index ${index}:`)
        console.log(error.response.data.message)
        return
    }
    console.log(`Created new Transaction for index ${index}: ${JSON.stringify(transaction, null, 2)}`)
    console.log(`  Broadcasting transaction:`)
    try {
        const broadcastResult = await lunaDaemon.tx.broadcast(transaction);
        console.log(`Broadcast result for index ${index}: ${ JSON.stringify(broadcastResult, null, 2) }`)
        return broadcastResult
    } catch (error) {
        console.log(`  Error broadcasting transaction for index ${index}:`)
        console.log(error.response.data.message)
        return
    }
}

module.exports = {
    lunaEndpoints,
    lunaChainIds,
    initializeLunaDaemon,
    getKeyBytesFromRawKey,
    createLunaWalletFromMnemonic,
    createLunaWalletFromKey,
    getBalances,
    sendLuna
}
