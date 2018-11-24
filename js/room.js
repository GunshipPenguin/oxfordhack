var THREE = require('three');
var BoxLineGeometry = require('./box-line-geometry.js');
var UnconfirmedTransactionMesh = require('./unconfirmed-transaction-mesh');

class Room extends THREE.LineSegments {
    constructor() {
        super(new BoxLineGeometry(6, 6, 6, 10, 10, 10), new THREE.LineBasicMaterial({color: 0x808080}));
    }

    addUnconfirmedTransaction() {
        var mesh = new UnconfirmedTransactionMesh();
        mesh.position.x = Math.random() * 4 - 2;
        mesh.position.y = Math.random() * 4 - 2;
        mesh.position.z = Math.random() * 4 - 2;

        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;
        mesh.rotation.z = Math.random() * 2 * Math.PI;

        mesh.scale.x = Math.random() + 0.5;
        mesh.scale.y = Math.random() + 0.5;
        mesh.scale.z = Math.random() + 0.5;

        mesh.userData.velocity = new THREE.Vector3();
        mesh.userData.velocity.x = Math.random() * 0.01 - 0.005;
        mesh.userData.velocity.y = Math.random() * 0.01 - 0.005;
        mesh.userData.velocity.z = Math.random() * 0.01 - 0.005;

        this.add(mesh);
    }
}

module.exports = Room;
