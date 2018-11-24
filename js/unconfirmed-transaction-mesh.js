var THREE = require('three');

class UnconfirmedTransactionMesh extends THREE.Mesh {
    constructor(txInfo) {
        super(new THREE.BoxBufferGeometry(0.1, 0.1, 0.1),
            new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}));

        this.txInfo = txInfo;

        this.velocityX = Math.random() * 0.01 - 0.05;
        this.velocityY = Math.random() * 0.01 - 0.05;
        this.velocityZ = Math.random() * 0.01 - 0.05;
    }

    getEstimatedAmount() {
        var smallest = Infinity;
        this.txInfo.x.out.forEach(output => {
            smallest = Math.min(smallest, output.value);
        });

        return smallest;
    }
}

module.exports = UnconfirmedTransactionMesh;
