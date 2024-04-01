const Blockchain = require('../src/blockchain');
const ZSchema = require('z-schema');

const validator = new ZSchema({});

const blockSchema = {
    type: 'object',
    properties: {
        index: { type: 'number' },
        timestamp: { type: 'number' },
        transactions: {
            type: 'array',
            items: { type: 'object' },
        },
        nonce: { type: 'number' },
        hash: { type: 'string' },
        previousBlockHash: { type: 'string' },
    },
    required: ['index', 'timestamp', 'transactions', 'nonce', 'hash', 'previousBlockHash'],
};

const transactionSchema = {
    type: 'object',
    properties: {
        transactionId: { type: 'string' },
        amount: { type: 'number' },
        sender: { type: 'string' },
        recipient: { type: 'string' },
    },
    required: ['transactionId', 'amount', 'sender', 'recipient'],
};

describe('Blockchain', () => {
    // constructor
    test('Should create a instance of a Blockchain object', (done) => {
        const myBlockchain = new Blockchain();

        expect(myBlockchain).toBeDefined();
        expect(myBlockchain.pendingTransactions).toBeDefined();
        expect(myBlockchain.pendingTransactions.length).toBe(0);
        expect(myBlockchain.chain).toBeDefined();
        expect(myBlockchain.chain.length).toBe(1);
        expect(myBlockchain.currentNodeUrl).toBeDefined();
        expect(myBlockchain.currentNodeUrl.startsWith('http')).toBe(true);
        expect(myBlockchain.networkNodes).toBeDefined();
        expect(myBlockchain.networkNodes.length).toBe(0);
        // Genesis block
        expect(myBlockchain.chain[0].hash).toBe('0');
        expect(myBlockchain.chain[0].previousBlockHash).toBe('0');
        expect(myBlockchain.chain[0].nonce).toBe(100);
        expect(myBlockchain.chain[0].transactions.length).toBe(0);

        done();
    });
    // createNewBlock
    test('Should create a new empty block', (done) => {
        const myBlockchain = new Blockchain();
        const newBlock = myBlockchain.createNewBlock(2389, 'sdnjgdngkd', 'wbjf34fsnv');

        expect(validator.validate(newBlock, blockSchema)).toBe(true);
        expect(newBlock.nonce).toBe(2389);
        expect(newBlock.index).toBe(2);

        expect(myBlockchain.chain.length).toBe(2);

        done();
    });
    test('Should create multiple blocks', (done) => {
        const myBlockchain = new Blockchain();
        const newBlock1 = myBlockchain.createNewBlock(2389, 'sdnjgdngkd', 'wbjf34fsnv');
        const newBlock2 = myBlockchain.createNewBlock(6423, 'wbjf34fsnv', 'fgrtudffdh');
        const newBlock3 = myBlockchain.createNewBlock(9806, 'fgrtudffdh', 'htjtyfsaff');

        expect(validator.validate(newBlock1, blockSchema)).toBe(true);
        expect(validator.validate(newBlock2, blockSchema)).toBe(true);
        expect(validator.validate(newBlock3, blockSchema)).toBe(true);

        expect(myBlockchain.chain.length).toBe(4);

        done();
    });
    // getLastBlock
    test('Should get the last block', (done) => {
        const myBlockchain = new Blockchain();
        const newBlock = myBlockchain.createNewBlock(2389, 'sdnjgdngkd', 'wbjf34fsnv');
        const lastBlock = myBlockchain.getLastBlock();

        expect(lastBlock).toBe(newBlock);
        expect(lastBlock.index).toBe(newBlock.index);

        done();
    });
    // createNewTransaction
    test('Should create a pending transaction', (done) => {
        const myBlockchain = new Blockchain();
        let newTransaction = myBlockchain.createNewTransaction(10, 'abc', 'def');

        expect(newTransaction).toBeDefined();
        expect(validator.validate(newTransaction, transactionSchema)).toBe(true);
        
        done();
    });
    // addPendingTransaction
    test('Should add a pending transaction', (done) => {
        const myBlockchain = new Blockchain();
        let newTransaction = myBlockchain.createNewTransaction(10, 'abc', 'def');
        let expectedIndex = myBlockchain.addPendingTransaction(newTransaction);

        expect(myBlockchain.pendingTransactions.length).toBe(1);
        expect(expectedIndex).toBe(2);

        myBlockchain.createNewBlock(1234, 'aaa', 'bbb');
        newTransaction = myBlockchain.createNewTransaction(20, 'abc', 'def');
        expectedIndex = myBlockchain.addPendingTransaction(newTransaction);
        expect(myBlockchain.pendingTransactions.length).toBe(1);
        expect(expectedIndex).toBe(3);
        
        done();
    });
    // hashBlock
    test('Should return the sha256 hash of a block', (done) => {
        const myBlockchain = new Blockchain();
        
        const blockData = [
            {
                amount: 10,
                sender: 'abc',
                recipient: 'def',
            },
            {
                amount: 20,
                sender: 'fdsn',
                recipient: 'jlkdsg',
            },
            {
                amount: 30,
                sender: 'kefdp',
                recipient: '0edvkn',
            },
        ];

        const hash = myBlockchain.hashBlock('dsfsdfsg', blockData, 1234);
        expect(hash).toBeDefined();

        blockData[0].amount = 11;
        const tamperedHash = myBlockchain.hashBlock('dsfsdfsg', blockData, 1234);
        expect(tamperedHash).toBeDefined();
        expect(hash !== tamperedHash).toBe(true);

        blockData[0].amount = 10;
        const restoredHash = myBlockchain.hashBlock('dsfsdfsg', blockData, 1234);
        expect(restoredHash).toBeDefined();
        expect(hash === restoredHash).toBe(true);

        done();
    });
    // proofOfWork
    test('Should return a nonce that creates a 0000 hash', (done) => {
        const myBlockchain = new Blockchain();
        
        const previousBlockHash = 'skdnfdknbdgdfkndfknd';
        const currentBlockData = [
            {
                amount: 10,
                sender: 'abc',
                recipient: 'def',
            },
            {
                amount: 20,
                sender: 'fdsn',
                recipient: 'jlkdsg',
            },
            {
                amount: 30,
                sender: 'kefdp',
                recipient: '0edvkn',
            },
        ];

        const nonce = myBlockchain.proofOfWork(previousBlockHash, currentBlockData);
        expect(nonce).toBeDefined();
        expect(nonce >= 0).toBe(true);

        const hash = myBlockchain.hashBlock(previousBlockHash, currentBlockData, nonce);
        expect(hash.startsWith('0000')).toBe(true);

        done();
    });
    // chainIsValid
    test('Should validate an empty chain', (done) => {
        const myBlockchain = new Blockchain();

        const isValid = myBlockchain.chainIsValid(myBlockchain.chain);
        expect(isValid).toBe(true);

        done();
    });
    test('Should validate a chain', (done) => {
        const myBlockchain = new Blockchain(3);

        myBlockchain.addPendingTransaction(myBlockchain.createNewTransaction(10, 'abc', 'def'));
        myBlockchain.addPendingTransaction(myBlockchain.createNewTransaction(20, 'dbsf', 'vdsdg'));

        const blockData1 = { transactions: myBlockchain.pendingTransactions, index: 2 };
        const nonce1 = myBlockchain.proofOfWork('0', blockData1);
        const hash1 = myBlockchain.hashBlock('0', blockData1, nonce1);
        const block1 = myBlockchain.createNewBlock(nonce1, '0', hash1);

        myBlockchain.addPendingTransaction(myBlockchain.createNewTransaction(30, 'dsbjk', 'dsfsdf'));
        const blockData2 = { transactions: myBlockchain.pendingTransactions, index: 3 };
        const nonce2 = myBlockchain.proofOfWork(hash1, blockData2);
        const hash2 = myBlockchain.hashBlock(hash1, blockData2, nonce2);
        const block2 = myBlockchain.createNewBlock(nonce2, hash1, hash2);

        const isValid = myBlockchain.chainIsValid(myBlockchain.chain);
        expect(isValid).toBe(true);

        done();
    });
    test('Should fail because previous block hash is wrong', (done) => {
        const myBlockchain = new Blockchain(3);

        myBlockchain.addPendingTransaction(myBlockchain.createNewTransaction(10, 'abc', 'def'));
        myBlockchain.addPendingTransaction(myBlockchain.createNewTransaction(20, 'dbsf', 'vdsdg'));

        const blockData1 = { transactions: myBlockchain.pendingTransactions, index: 2 };
        const nonce1 = myBlockchain.proofOfWork('0', blockData1);
        const hash1 = myBlockchain.hashBlock('0', blockData1, nonce1);
        const block1 = myBlockchain.createNewBlock(nonce1, '0', hash1);
        
        myBlockchain.addPendingTransaction(myBlockchain.createNewTransaction(30, 'dsbjk', 'dsfsdf'));
        const blockData2 = { transactions: myBlockchain.pendingTransactions, index: 3 };
        const nonce2 = myBlockchain.proofOfWork(hash1, blockData2);
        const hash2 = myBlockchain.hashBlock(hash1, blockData2, nonce2);
        const block2 = myBlockchain.createNewBlock(nonce2, hash1, hash2);

        // insert wrong hash
        myBlockchain.chain[myBlockchain.chain.length - 1].previousBlockHash = '1';

        const isValid = myBlockchain.chainIsValid(myBlockchain.chain);
        expect(isValid).toBe(false);

        done();
    });
    test('Should fail because current block has been changed', (done) => {
        const myBlockchain = new Blockchain(3);

        myBlockchain.addPendingTransaction(myBlockchain.createNewTransaction(10, 'abc', 'def'));
        myBlockchain.addPendingTransaction(myBlockchain.createNewTransaction(20, 'dbsf', 'vdsdg'));

        const blockData1 = { transactions: myBlockchain.pendingTransactions, index: 2 };
        const nonce1 = myBlockchain.proofOfWork('0', blockData1);
        const hash1 = myBlockchain.hashBlock('0', blockData1, nonce1);
        const block1 = myBlockchain.createNewBlock(nonce1, '0', hash1);
        
        myBlockchain.addPendingTransaction(myBlockchain.createNewTransaction(30, 'dsbjk', 'dsfsdf'));
        const blockData2 = { transactions: myBlockchain.pendingTransactions, index: 3 };
        const nonce2 = myBlockchain.proofOfWork(hash1, blockData2);
        const hash2 = myBlockchain.hashBlock(hash1, blockData2, nonce2);
        const block2 = myBlockchain.createNewBlock(nonce2, hash1, hash2);

        // insert wrong hash
        myBlockchain.chain[myBlockchain.chain.length - 1].transactions.push(
            myBlockchain.createNewTransaction(50, 'vdsdg', 'dbsf')
        );

        const isValid = myBlockchain.chainIsValid(myBlockchain.chain);
        expect(isValid).toBe(false);

        done();
    });
    test('Should fail because genesis block has wrong hash', (done) => {
        const myBlockchain = new Blockchain();
        myBlockchain.chain[0].hash = '1';

        const isValid = myBlockchain.chainIsValid(myBlockchain.chain);
        expect(isValid).toBe(false);

        done();
    });
    test('Should fail because genesis block has wrong previous hash', (done) => {
        const myBlockchain = new Blockchain();
        myBlockchain.chain[0].previousBlockHash = '1';

        const isValid = myBlockchain.chainIsValid(myBlockchain.chain);
        expect(isValid).toBe(false);

        done();
    });
    test('Should fail because genesis block has wrong nonce', (done) => {
        const myBlockchain = new Blockchain();
        myBlockchain.chain[0].nonce = 123;

        const isValid = myBlockchain.chainIsValid(myBlockchain.chain);
        expect(isValid).toBe(false);

        done();
    });
});
