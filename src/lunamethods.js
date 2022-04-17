require('dotenv').config()
const fetch = require('isomorphic-fetch')
const { MsgSend, MnemonicKey, Coins, LCDClient } = require('@terra-money/terra.js')

const endpoints = {
    'https://lcd.terra.money': 'columbus-5',
    'https://terra.stakesystems.io': 'columbus-5',
    'https://lcd.mcontrol.mi': 'columbus-5',
    'https://terra-lcd.easy2stake.com': 'columbus-5',
    'htttp://172.104.133.249': 'columbus-5',
    'hhtps://blockdaemon-terra-lcd.api.bdnodes.net:1317': 'columbus-5',
    // 'https://bombay-lcd.terra.dev/': 'bombay-12',
    // 'https://bombay.stakesystems.io': 'bombay-12',
}



const getGasPriceCoins = async () => {
    // Fetch gas prices and convert to `Coin` format.
    const gasPricesResponse = await fetch('https://bombay-fcd.terra.dev/v1/txs/gas_prices')
    const gasPricesJson = await gasPricesResponse.json();
    const gasPricesCoins = new Coins(gasPricesJson);
    return gasPricesCoins
}

const initializeLunaDaemon = () => {
    console.log('Initializing luna daemon')
    // const gasPricesCoins = getGasPriceCoins();
    const lunaDaemon = new LCDClient({
        URL: "https://terra-lcd.easy2stake.com",
        chainID: "columbus-5",
        gasPrices: { uluna: 0.015 }, // gasPricesCoins,
        gasAdjustment: "1.4"
        // gas: 10000000,
    });
    return lunaDaemon
}

const createLunaWallet = async (lunaDaemon) => {
    console.log(`Creating new wallet`)
    const mnemonicKey = new MnemonicKey({
        mnemonic: process.env.MNEMONIC
    });
    const wallet = lunaDaemon.wallet(mnemonicKey);
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


const sendLuna = async (lunaDaemon, wallet, toAddress, amount) => {
    console.log(`Sending ${amount} to ${toAddress}`)
    const uLunaAmount = `${amount * 1000000}`
    console.log(`  uLunaAmount: ${uLunaAmount}, typeof: ${typeof uLunaAmount}`)
    console.log(`  Converting to uLuna: ${uLunaAmount}`)
    console.log(`  Creating new MsgSend:`)
    const msgSend = new MsgSend(
        wallet.key.accAddress,
        toAddress,
        { uluna: uLunaAmount }
    );
    // console.log({ msgSend })
    console.log(JSON.stringify(msgSend, null, 2))
    console.log(`  Creating new transaction:`)
    let transaction;
    try {
        transaction = await wallet.createAndSignTx({ msgs: [msgSend] });
    } catch (error) {
        console.log(`  Error creating transaction:`)
        console.log(error.response.data.message)
        return
    }
    // console.log({ transaction })
    console.log(JSON.stringify(transaction, null, 2))
    console.log(`  Broadcasting transaction:`)
    const broadcastResult = await lunaDaemon.tx.broadcast(transaction);
    console.log({ broadcastResult })
    return broadcastResult
}

module.exports = {
    endpoints,
    initializeLunaDaemon,
    createLunaWallet,
    getBalances,
    sendLuna
}
