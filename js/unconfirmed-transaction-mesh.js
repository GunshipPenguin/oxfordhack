var THREE = require('three');

class UnconfirmedTransactionMesh extends THREE.Mesh {
    constructor() {
        super(new THREE.BoxBufferGeometry(0.1, 0.1, 0.1),
            new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}));
    }
}

module.exports = UnconfirmedTransactionMesh;
