const sha256 = require("sha256");

class Blockchain {

    constructor(difficulty = 4) {
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = difficulty;
    }

    createNewBlock(nonce, previousBlockHash, hash) {
        const newBlock = {
            index: this.chain.length,
            timestamp: Date.now(),
            // adds pending transactions to this block
            transactions: this.pendingTransactions,
            // proof of work of the block
            nonce,
            // hash of all the new transactions of the current block
            hash,
            // hash taken from the previous block
            previousBlockHash,
        }

        // transactions are now in the blockchain so the list will be cleared
        this.pendingTransactions = [];
        this.chain.push(newBlock);

        return newBlock;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    createNewTransaction(amount, sender, recipient) {
        const newTransaction = {
            amount,
            sender,
            recipient,
        };

        this.pendingTransactions.push(newTransaction);

        if (this.chain.length === 0) {
            return 0;
        }

        return this.getLastBlock()['index'] + 1;
    }

    hashBlock(previousBlockHash, currentBlockData, nonce) {
        const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(dataAsString);
        return hash;
    }

    /**
     * Repeatedly hash block until it finds the correct hash
     * (example: must start with four 0) by changing the nonce.
     * Return the magic nonce value
     * @param {string} previousBlockHash 
     * @param {object} currentBlockData 
     */
    proofOfWork(previousBlockHash, currentBlockData) {
        const prefix = Buffer.alloc(this.difficulty, '0').toString();

        let nonce = -1;
        let hash = '';
        do {
            nonce++;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        } while(!hash.startsWith(prefix));
        return nonce;
    }
}

module.exports = Blockchain;
