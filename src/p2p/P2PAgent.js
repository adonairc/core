class ConsensusP2PAgent {

    constructor(blockchain, p2pChannel) {
        this._blockchain = blockchain;
        this._channel = p2pChannel;

        p2pClient.on('inv', (msg, sender) => this._onInv(msg, sender));
        p2pClient.on('getdata', (msg, sender) => this._onGetData(msg, sender));
        p2pClient.on('notfound', (msg, sender) => this._onNotFound(msg, sender));
        p2pClient.on('block', (msg, sender) => this._onBlock(msg, sender));
    }

    _onInv(msg, sender) {
        // check which of the advertised objects we know
        // request unknown objects

        // XXX test: request all objects
        sender.getdata(msg.vectors);
    }

    _onGetData(msg, sender) {
        // check which of the requested objects we know
        // send back all known objects
        // send notfound for unknown objects
        const unknownVectors = [];
        for (let vector of msg.vectors) {
            switch (vector.type) {
                case InvVector.Type.BLOCK:
                    const block = this._blockchain.getBlock(vector.hash);
                    if (block) {
                        // We have found a requested block, send it back to the sender.
                        sender.block(block);
                    } else {
                        // Requested block is unknown.
                        unknownVectors.push(vector);
                    }
                    break;

                case InvVector.Type.TRANSACTION:
                    // TODO
                    unknownVectors.push(vector);
                    break;

                default:
                    throw 'Invalid inventory type: ' + vector.type;
            }
        }

        // Report any unknown objects back to the sender.
        if (unknownVectors.length) {
            sender.notfound(unknownVectors);
        }
    }

    _onNotFound(msg, sender) {
        // TODO
    }

    _onBlock(msg, sender) {
        // verify block
        // put block into blockchain
        this._blockchain.pushBlock(msg.block);
    }

}