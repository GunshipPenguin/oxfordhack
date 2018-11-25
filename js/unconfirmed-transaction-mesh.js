var THREE = require('three');

BTC_TO_GBP = 0.00034;

class UnconfirmedTransactionMesh extends THREE.Mesh {
    constructor(txInfo) {
        super(new THREE.BoxBufferGeometry(0.1, 0.1, 0.1),
            new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}));

        this.txInfo = txInfo;
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
