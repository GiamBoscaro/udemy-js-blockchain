class Blockchain {

    constructor() {
        this.chain = [];
        this.newTransactions = [];
    }

    createNewBlock(nonce, previousBlockHash, hash) {
        const newBlock = {
            index: this.chain.length,
            timestamp: Date.now(),
            // adds pending transactions to this block
            transactions: this.newTransactions,
            // proof of work of the block
            nonce,
            // hash of all the new transactions of the current block
            hash,
            // hash taken from the previous block
            previousBlockHash,
        }

        // transactions are now in the blockchain so the list will be cleared
        this.newTransactions = [];
        this.chain.push(newBlock);

        return newBlock;
    }
}

module.exports = Blockchain;
