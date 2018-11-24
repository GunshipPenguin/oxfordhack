const WS_ENDPOINT = 'wss://ws.blockchain.info/inv';

var blockchainApi = {

    subscribeToTransactions: function (f) {
        var connection = new WebSocket(WS_ENDPOINT);
        var transactionData = {"op": "unconfirmed_sub"};

        connection.onopen = function () {
            connection.send(JSON.stringify(transactionData))
        };

        connection.onerror = function (error) {
            console.log('WebSocket Error' + error)
        };

        connection.onmessage = function (e) {
            f(JSON.parse(e.data));
        };
    },
    subscribeToBlocks: function (f) {
        var connection = new WebSocket(WS_ENDPOINT);
        var blockData = {"op": "blocks_sub"};
        var transactions = [];

        connection.onopen = function () {
            connection.send(JSON.stringify(blockData))
        };

        connection.onerror = function (error) {
            console.log('WebSocket Error' + error)
        };

        connection.onmessage = function (e) {
            f(JSON.parse(e.message));
        };
    }
};

module.exports = blockchainApi;
