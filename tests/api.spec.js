/* eslint-disable no-undef */
const axios = require('axios');
const ZSchema = require('z-schema');

const validator = new ZSchema({});
const endpoint = 'http://localhost:3000';

const blockchainSchema = {
    type: 'object',
    properties: {
        chain: {
            type: 'array',
            items: { type: 'object' },
        },
        pendingTransactions: {
            type: 'array',
            items: { type: 'object' },
        },
    },
    required: ['chain', 'pendingTransactions'],
};

const transactionSchema = {
    type: 'object',
    properties: {
        amount: { type: 'number' },
        sender: { type: 'string' },
        recipient: { type: 'string' },
    },
    required: ['amount', 'sender', 'recipient'],
};

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

describe('API', () => {
  // /blockchain
  test('Should return the blockchain', (done) => {
    axios.get(`${endpoint}/blockchain`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(validator.validate(res.data, blockchainSchema)).toBe(true);
        expect(res.data.chain.length).toBe(1);
        done();
      })
      .catch((e) => {
        console.error(e);
        expect(e).toBeDefined();
        done(e);
      });
  });
  // /transaction
  test('Should add a new transaction', (done) => {
    const data = {
        amount: 10,
        sender: 'abc',
        recipient: 'def',
    };
    axios.post(`${endpoint}/transaction`, data)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.data.note).toBeDefined();
        done();
      })
      .catch((e) => {
        console.error(e);
        expect(e).toBeDefined();
        done(e);
      });
  });
  // /mine
  test('Should mine a new block', (done) => {
    axios.get(`${endpoint}/mine`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.data.note).toBeDefined();
        expect(validator.validate(res.data.block, blockSchema)).toBe(true);
        done();
      })
      .catch((e) => {
        console.error(e);
        expect(e).toBeDefined();
        done(e);
      });
  });
});
