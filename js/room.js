var THREE = require('three');
var BoxLineGeometry = require('./box-line-geometry.js');
var UnconfirmedTransactionMesh = require('./unconfirmed-transaction-mesh');

BTC_SCALE = 0.07;
SCALE_CAP = 5.5;

class Room extends THREE.LineSegments {
    constructor(roomSize) {
        super(new BoxLineGeometry(roomSize*2, roomSize*2, roomSize*2, 10, 10, 10), new THREE.LineBasicMaterial({color: 0x808080}));
        this.roomSize = roomSize;
    }

    addUnconfirmedTransaction(txInfo) {
        var newTx = new UnconfirmedTransactionMesh(txInfo);

        newTx.position.x = Math.random() * 4 - 2;
        newTx.position.y = Math.random() * 4 - 2;
        newTx.position.z = Math.random() * 4 - 2;

        newTx.rotation.x = Math.random() * 2 * Math.PI;
        newTx.rotation.y = Math.random() * 2 * Math.PI;
        newTx.rotation.z = Math.random() * 2 * Math.PI;

        var estAmount = newTx.getEstimatedAmount() * 10e-8; // Estimated amount in BTC
        newTx.scale.x = Math.min((Math.random()/2 + 0.5) * (estAmount / BTC_SCALE), SCALE_CAP);
        newTx.scale.y = Math.min((Math.random()/2 + 0.5) * (estAmount / BTC_SCALE), SCALE_CAP);
        newTx.scale.z = Math.min((Math.random()/2 + 0.5) * (estAmount / BTC_SCALE), SCALE_CAP);

        newTx.userData.velocity = new THREE.Vector3();
        newTx.userData.velocity.x = Math.random() * 0.02 - 0.005;
        newTx.userData.velocity.y = Math.random() * 0.02 - 0.005;
        newTx.userData.velocity.z = Math.random() * 0.02 - 0.005;

        this.add(newTx);
    }

    processBlock(block) {
        console.log(block);
    }

    moveUnconfirmedTransactions(delta) {
        this.children.forEach(child => {
            if (child.isBeingLookedAt) {
                return;
            }

            child.userData.velocity.multiplyScalar(1 - (0.0001 * delta));

            child.position.add(child.userData.velocity);
            if (child.position.x < -this.roomSize || child.position.x > this.roomSize) {
                child.position.x = THREE.Math.clamp(child.position.x, -3, 3);
                child.userData.velocity.x = -child.userData.velocity.x;
            }

            if (child.position.y < -this.roomSize || child.position.y > this.roomSize) {
                child.position.y = THREE.Math.clamp(child.position.y, -this.roomSize, this.roomSize);
                child.userData.velocity.y = -child.userData.velocity.y;
            }

            if (child.position.z < -this.roomSize || child.position.z > this.roomSize) {
                child.position.z = THREE.Math.clamp(child.position.z, -3, 3);
                child.userData.velocity.z = -child.userData.velocity.z;
            }

            child.rotation.x += child.userData.velocity.x * 2 * delta;
            child.rotation.y += child.userData.velocity.y * 2 * delta;
            child.rotation.z += child.userData.velocity.z * 2 * delta;
        });
    }
}

module.exports = Room;
