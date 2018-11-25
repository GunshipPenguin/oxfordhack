var THREE = require('three');

class BlockchainBlock extends THREE.Mesh {
    constructor(len, blockInfo) {
        super(new THREE.BoxBufferGeometry(len, len, len),
            new THREE.MeshLambertMaterial({color: 0xffffff}));
        this.isBlockchainBlock = true;
        this.blockInfo = blockInfo;
    }
}

module.exports = BlockchainBlock;
