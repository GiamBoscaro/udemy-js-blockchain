class Blockchain {

    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
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

    hashBlock(blockData) {
        
    }
}

module.exports = Blockchain;
