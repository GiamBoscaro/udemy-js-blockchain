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
        expect(myBlockchain.newTransactions).toBeDefined();
        expect(myBlockchain.newTransactions.length).toBe(0);
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
});
