const express = require('express');
const uuid = require('uuid');
const axios = require('axios');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');

const app = express();

const port = process.argv[2];
const nodeAddress = uuid.v1().split('-').join('');
const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.send('Node is running');
});

// get entire blockchain
app.get('/blockchain', function (req, res) {
  res.send(bitcoin);
});

// create a new transaction
app.post('/transaction', function (req, res) {
    const newTransaction = req.body;
    const blockIndex = bitcoin.addPendingTransaction(newTransaction);
    res.json({ note: `Transaction will be added to block ${blockIndex}.`});
});

// create a new transaction and broadcast to all other nodes
app.post('/transaction/broadcast', async function (req, res) {
    const { sender, recipient, amount } = req.body;
    const newTransaction = bitcoin.createNewTransaction(amount, sender, recipient);
    bitcoin.addPendingTransaction(newTransaction);
    const promises = [];
    for (const url of bitcoin.networkNodes) {
        const promise = axios.post(`${url}/transaction`, newTransaction);
        promises.push(promise);
    }
    const data = await Promise.all(promises);
    res.json({ note: `Transaction created and broadcast successfully.`});
});

// mine a block
app.get('/mine', async function (req, res) {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock.index +1,
    };

    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const currentBlockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, currentBlockHash);
    
    const promises = [];
    for (const url of bitcoin.networkNodes) {
        const promise = axios.post(`${url}/receive-new-block`, newBlock);
        promises.push(promise);
    }
    const data = await Promise.all(promises);

    // Rewards the miner
    const rewardTransaction = bitcoin.createNewTransaction(12.5, '00', nodeAddress);
    await axios.post(`${bitcoin.currentNodeUrl}/transaction/broadcast`, rewardTransaction);

    res.json({ 
        note: "New block mined successfully", 
        block: newBlock,
    });
});

// Receive a new mined block from the network
app.post('/receive-new-block', function (req, res) {
    const newBlock = req.body;
    const lastBlock = bitcoin.getLastBlock();
    if (lastBlock.hash !== newBlock.previousBlockHash
        || lastBlock.index + 1 !== newBlock.index) {
        res.status(400).json({ note: 'New block rejected.', newBlock });
        return;
    }

    bitcoin.chain.push(newBlock);
    bitcoin.pendingTransactions = [];
    res.json({ note: 'New block received and accepted.', newBlock });  
});

// updates the blockchain of the current node based on the consensus
app.post('/consensus', async function (req, res) {
    const promises = [];
    for (const url of bitcoin.networkNodes) {
        const promise = axios.get(`${url}/blockchain`);
        promises.push(promise);
    }

    // idenfities if a blockchain in the network is longer than
    // the one hosted in the current node
    const blockchains = await Promise.all(promises);
    let longestChain = null;
    let newPendingTransactions = null;
    let longestChainLength = bitcoin.chain.length;
    for (const b of blockchains) {
        if (b.data.chain.length > longestChainLength 
            && bitcoin.chainIsValid(b.data.chain)) {
            longestChainLength = b.data.chain.length;
            longestChain = b.data.chain;
            newPendingTransactions = b.pendingTransactions;
        }
    }

    if (longestChain && bitcoin.chainIsValid(longestChain)) {
        bitcoin.chain = longestChain;
        bitcoin.pendingTransactions = newPendingTransactions;
        res.json({ note: 'This chain has been replaced.', chain: bitcoin.chain, replaced: true });  
    } else {
        res.json({ note: 'Current chain was not replaced.', chain: bitcoin.chain, replaced: false }); 
    }
});

// register a node and boradcast it to the network
app.post('/register-and-broadcast-node', async function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    const promises = [];
    if (!bitcoin.networkNodes.includes(newNodeUrl)) {
        bitcoin.networkNodes.push(newNodeUrl);
    }
    for (const url of bitcoin.networkNodes) {
        const promise = axios.post(`${url}/register-node`, { newNodeUrl });
        promises.push(promise);
    }
    const data = await Promise.all(promises);
    const allNetworkNodes = [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ];
    await axios.post(`${newNodeUrl}/register-nodes-bulk`, { allNetworkNodes });

    res.json({ note: 'New node registered to the network successfully.'});
});

// register a node with the network
app.post('/register-node', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if (!bitcoin.networkNodes.includes(newNodeUrl)
        && newNodeUrl !== bitcoin.currentNodeUrl) {
        bitcoin.networkNodes.push(newNodeUrl);
    }
    
    res.json({ note: 'New node registered succesfully.'});
});

// register multiple nodes at once
app.post('/register-nodes-bulk', function (req, res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    for (const url of allNetworkNodes) {
        if (!bitcoin.networkNodes.includes(url)
            && url !== bitcoin.currentNodeUrl) {
            bitcoin.networkNodes.push(url);
        }
    }

    res.json({ note: 'Bulk registration successful.'});
});

// get block by blockHash
app.get('/block/:blockHash', function(req, res) { 
	const blockHash = req.params.blockHash;
	const correctBlock = bitcoin.getBlock(blockHash);
	res.json(correctBlock);
});

// get transaction by transactionId
app.get('/transaction/:transactionId', function(req, res) {
	const transactionId = req.params.transactionId;
	const trasactionData = bitcoin.getTransaction(transactionId);
	res.json(trasactionData);
});

// get address by address
app.get('/address/:address', function(req, res) {
	const address = req.params.address;
	const addressData = bitcoin.getAddressData(address);
	res.json(addressData);
});

// serve the frontend
app.get('/block-explorer', function(req, res) {
	res.sendFile(`${process.cwd()}/view/index.html`);
});

app.listen(port, function() {
	console.log(`Listening on port ${port}...`);
    // Automatically registers the nodes to the network, passing
    // through node 1. Node 1 must be the first running.
    if (bitcoin.currentNodeUrl !== 'http://localhost:3001') {
        axios.post(
            `http://localhost:3001/register-and-broadcast-node`,
            { newNodeUrl: bitcoin.currentNodeUrl },
        )
        .then((res) => {
            console.log(res.data.note);
            console.log('Current nodes in the network', bitcoin.networkNodes);
        });
    }
});
