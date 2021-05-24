const PubNub = require("pubnub");

const credentials = {
  publishKey: "pub-c-9f8bc1a5-bd3a-4591-8596-45b8c4a782dc",
  subscribeKey: "sub-c-229c61be-a124-11eb-907e-3a7b703d9d8e",
  secretKey: "sec-c-YWFlNmUwYWItZjQ4Yi00MzU0LWIyYTUtMzUwMzYyNzU5YWIz",
};

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION",
};

class PubSub {
  constructor({ blockchain, transactionPool, wallet, redisUrl }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;

    this.pubnub = new PubNub(credentials);

    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

    this.pubnub.addListener(this.listener());
    // this.publisher = redis.createClient(redisUrl);
    // this.subscriber = redis.createClient(redisUrl);

    // this.subscribeToChannels();

    // this.subscriber.on("message", (channel, message) =>
    //   this.handleMessage(channel, message)
  }

  listener() {
    return {
      message: (messageObject) => {
        const { channel, message } = messageObject;

        console.log(
          `Message received. Channel: ${channel}. Message: ${message}`
        );
        const parsedMessage = JSON.parse(message);

        switch (channel) {
          case CHANNELS.BLOCKCHAIN:
            this.blockchain.replaceChain(parsedMessage, true, () => {
              this.transactionPool.clearBlockchainTransactions({
                chain: parsedMessage.chain,
              });
            });
            break;
          case CHANNELS.TRANSACTION:
            if (
              !this.transactionPool.existingTransaction({
                inputAddress: this.wallet.publicKey,
              })
            ) {
              this.transactionPool.setTransaction(parsedMessage);
            }
            break;
          default:
            return;
        }
      },
    };
  }

  publish({ channel, message }) {
    this.pubnub.publish({ message, channel });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }

  subscribeToChannels() {
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)],
    });
  }
}

module.exports = PubSub;
