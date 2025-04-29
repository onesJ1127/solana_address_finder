process.env.NODE_NO_WARNINGS = '1';
const { Worker } = require('worker_threads');
const os = require('os');
const fs = require('fs');
const path = require('path');

// 获取CPU核心数，设置为物理核心数的2倍
const numThreads = os.cpus().length * 2;
console.log(`CPU Cores: ${os.cpus().length}, Using ${numThreads} threads`);

let totalAttempts = 0;
let foundAddresses = 0;
const targetAddresses = 1; // 修改为1，找到一个地址后停止
let activeWorkers = new Set();
let lastAttemptsUpdate = Date.now();
let attemptsPerSecond = 0;

function saveAddress(address, secretKey, attempts) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `found_address_${timestamp}.json`;
    const data = {
        address,
        secretKey,
        attempts,
        timestamp: new Date().toISOString()
    };
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Address saved to: ${filename}`);
    console.log(`Progress: ${foundAddresses + 1}/${targetAddresses} addresses found`);
}

function updateAttemptsPerSecond() {
    const now = Date.now();
    const timeDiff = (now - lastAttemptsUpdate) / 1000;
    if (timeDiff >= 1) {
        attemptsPerSecond = Math.floor(totalAttempts / timeDiff);
        console.log(`Attempts per second: ${attemptsPerSecond}`);
        totalAttempts = 0;
        lastAttemptsUpdate = now;
    }
}

function createWorker() {
    const worker = new Worker(path.join(__dirname, 'worker.js'));
    activeWorkers.add(worker);
    worker.postMessage({});  // 发送一个空对象作为消息

    worker.on('message', (message) => {
        if (message.address) {
            console.log(`Found address: ${message.address}`);
            console.log(`Private Key: ${message.secretKey}`);
            console.log(`Total Attempts: ${totalAttempts + message.attempts}`);
            saveAddress(message.address, message.secretKey, totalAttempts + message.attempts);
            foundAddresses++;
            
            // 终止当前worker
            worker.terminate();
            activeWorkers.delete(worker);
            
            if (foundAddresses >= targetAddresses) {
                console.log('Target reached! Stopping all workers...');
                // 终止所有剩余的workers
                for (const w of activeWorkers) {
                    w.terminate();
                }
                process.exit(0);
            } else {
                // 创建新的worker继续搜索
                createWorker();
            }
        } else {
            totalAttempts += 10000;
            updateAttemptsPerSecond();
        }
    });

    worker.on('error', (error) => {
        console.error(error);
        worker.terminate();
        activeWorkers.delete(worker);
        // 如果worker出错，创建新的worker
        createWorker();
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
        activeWorkers.delete(worker);
        // 如果worker异常退出，创建新的worker
        createWorker();
    });
}

// 启动初始的workers
console.log(`Starting ${numThreads} workers...`);
for (let i = 0; i < numThreads; i++) {
    createWorker();
}

// 定期显示活动worker数量
setInterval(() => {
    console.log(`Active workers: ${activeWorkers.size}`);
}, 5000);


