var THREE = require('three')

class confirmedTransaction extends THREE.Mesh{
  constructor(len) {
      super(new THREE.BoxBufferGeometry(len, len, len),
          new THREE.MeshLambertMaterial({color:0x00ff000}));
  }
}

module.exports = confirmedTransaction;
