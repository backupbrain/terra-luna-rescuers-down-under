const {
    initializeLunaDaemon,
} = require('./lunamethods')

const fetchTransactionStatus = async () => {
    console.log('============= Fetching Transaction Status =================')
    const lunaDaemon = initializeLunaDaemon()
    console.log('\n')
    const hash = process.env.TRANSACTION_HASH;
    const txInfo = await lunaDaemon.tx.txInfo(hash);
    console.log(txInfo);
}


fetchTransactionStatus()