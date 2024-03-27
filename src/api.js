const express = require('express');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');

const app = express();

const nodeAddress = uuid.v1().split('-').join('');
const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.listen(3000, function() {
	console.log('Listening on port 3000...');
});
