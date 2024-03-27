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
    const { sender, recipient, amount } = req.body;
    const blockIndex = bitcoin.createNewTransaction(amount, sender, recipient);
    res.json({ note: `Transaction will be added to block ${blockIndex}.`});
});

// mine a block
app.get('/mine', function (req, res) {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock.index +1,
    };

    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const currentBlockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    bitcoin.createNewTransaction(12.5, '00', nodeAddress)

    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, currentBlockHash);
    res.json({ 
        note: "New block mined successfully", 
        block: newBlock,
    });
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

app.listen(port, function() {
	console.log(`Listening on port ${port}...`);
});
