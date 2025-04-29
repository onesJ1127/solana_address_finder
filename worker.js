const { parentPort } = require('worker_threads');
const solanaWeb3 = require('@solana/web3.js');
const bs58 = require('bs58').default;

function generateKeypair() {
    return solanaWeb3.Keypair.generate();
}

function checkAddress(address) {
    // 检查前5个字符是否相同
    const firstFive = address.substring(0, 5);
    return firstFive.split('').every(char => char === firstFive[0]);
}

parentPort.on('message', () => {
    let attempts = 0;
    while (true) {
        const keypair = generateKeypair();
        const address = keypair.publicKey.toBase58();

        attempts++;
        if (checkAddress(address)) {
            parentPort.postMessage({ address, secretKey: bs58.encode(keypair.secretKey), attempts });
            break;
        }

        if (attempts % 10000 === 0) {
            parentPort.postMessage({ attempts });
        }
    }
});
