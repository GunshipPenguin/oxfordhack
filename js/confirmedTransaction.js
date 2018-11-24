var three = require('three')

class confirmedTransaction extends THREE.Mesh() {

  constructor(blockSize) {
      super(new THREE.BoxBufferGeometry(blockSize, blockSize, blockSize),
          new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}));
  }

}
