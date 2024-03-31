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
        currentNodeUrl: { type: 'string' },
        networkNodes: {
          type: 'array',
          items: { type: 'string' },
      }
    },
    required: ['chain', 'pendingTransactions', 'currentNodeUrl', 'networkNodes'],
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
        transactionId: 111,
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
  // /transaction
  test('Should add a new transaction and broadcast it to existing nodes', (done) => {
    const data = {
        amount: 10,
        sender: 'abc',
        recipient: 'def',
    };
    axios.post(`${endpoint}/transaction/broadcast`, data)
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
  // /register-and-broadcast-node
  test('Should add a new node to the network and broadcast its url', (done) => {
    const data = {
      newNodeUrl: 'http://localhost:3000',
    };
    axios.post(`${endpoint}/register-and-broadcast-node`, data)
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
  // /register-node
  test('Should register a new node url to an existing node', (done) => {
    const data = {
      newNodeUrl: 'http://localhost:3000',
    };
    axios.post(`${endpoint}/register-node`, data)
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
  // /register-nodes-bulk
  test('Should add existing nodes of the network to the list', (done) => {
    const data = {
      allNetworkNodes: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
      ],
    };
    axios.post(`${endpoint}/register-nodes-bulk`, data)
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
});
