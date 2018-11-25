var THREE = require('three');
var BoxLineGeometry = require('./box-line-geometry.js');
var UnconfirmedTransactionMesh = require('./unconfirmed-transaction-mesh');

BTC_SCALE = 0.40;
SCALE_CAP = 15.0;

function randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Room extends THREE.Object3D {
    constructor(roomSize) {
        super();
        this.roomSize = roomSize;
    }

    addUnconfirmedTransaction(txInfo) {
        var newTx = new UnconfirmedTransactionMesh(txInfo);

        newTx.position.x = randRange(-this.roomSize, this.roomSize);
        newTx.position.y = randRange(-this.roomSize, this.roomSize);
        newTx.position.z = randRange(-this.roomSize, this.roomSize);

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
                child.position.x = THREE.Math.clamp(child.position.x, -this.roomSize, this.roomSize);
                child.userData.velocity.x = -child.userData.velocity.x;
            }

            if (child.position.y < -this.roomSize || child.position.y > this.roomSize) {
                child.position.y = THREE.Math.clamp(child.position.y, -this.roomSize, this.roomSize);
                child.userData.velocity.y = -child.userData.velocity.y;
            }

            if (child.position.z < -this.roomSize || child.position.z > this.roomSize) {
                child.position.z = THREE.Math.clamp(child.position.z, -this.roomSize, this.roomSize);
                child.userData.velocity.z = -child.userData.velocity.z;
            }

            child.rotation.x += child.userData.velocity.x * 2 * delta;
            child.rotation.y += child.userData.velocity.y * 2 * delta;
            child.rotation.z += child.userData.velocity.z * 2 * delta;
        });
    }
}

module.exports = Room;
