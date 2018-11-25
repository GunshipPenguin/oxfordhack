var THREE = require('three');
var txColors = [0x04ff00, 0x55ff4c, 0x87ffa3, 0xacff9b, 0x44e253, 0x87ff26, 0xb5ffa0, 0x09bc00];

BTC_TO_GBP = 0.00034;

class UnconfirmedTransactionMesh extends THREE.Mesh {
    constructor(txInfo) {
        super(new THREE.BoxBufferGeometry(0.1, 0.1, 0.1),
            new THREE.MeshLambertMaterial({color: txColors[Math.floor(Math.random() * txColors.length)]}));
        this.txInfo = txInfo;
        this.isUnconfirmedTransaction = true;
    }

    getEstimatedAmount() {
        var smallest = Infinity;
        this.txInfo.x.out.forEach(output => {
            smallest = Math.min(smallest, output.value);
        });

        return smallest;
    }

    getEstimatedAmountGBP() {
        return this.getEstimatedAmount() * BTC_TO_GBP;
    }
}

module.exports = UnconfirmedTransactionMesh;
