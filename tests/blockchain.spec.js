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

describe('Blockchain', () => {
    // constructor
    test('Should create a instance of a Blockchain object', (done) => {
        const myBlockchain = new Blockchain();

        expect(myBlockchain).toBeDefined();
        expect(myBlockchain.pendingTransactions).toBeDefined();
        expect(myBlockchain.pendingTransactions.length).toBe(0);
        expect(myBlockchain.chain).toBeDefined();
        expect(myBlockchain.chain.length).toBe(0);

        done();
    });
    // createNewBlock
    test('Should create a new empty block', (done) => {
        const myBlockchain = new Blockchain();
        const newBlock = myBlockchain.createNewBlock(2389, 'sdnjgdngkd', 'wbjf34fsnv');

        expect(validator.validate(newBlock, blockSchema)).toBe(true);
        expect(newBlock.nonce).toBe(2389);
        expect(newBlock.index).toBe(0);

        expect(myBlockchain.chain.length).toBe(1);

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

        expect(myBlockchain.chain.length).toBe(3);

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
    test('Should add a pending transaction', (done) => {
        const myBlockchain = new Blockchain();
        let expectedIndex = myBlockchain.createNewTransaction(10, 'abc', 'def');

        expect(myBlockchain.pendingTransactions.length).toBe(1);
        expect(expectedIndex).toBe(0);

        myBlockchain.createNewBlock(1234, 'aaa', 'bbb');
        expectedIndex = myBlockchain.createNewTransaction(20, 'abc', 'def');
        expect(myBlockchain.pendingTransactions.length).toBe(1);
        expect(expectedIndex).toBe(1);
        
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
});
