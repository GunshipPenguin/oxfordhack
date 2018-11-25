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
        this.transactionObjects = [];
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
        
        this.transactionObjects.push(newTx);
        this.add(newTx);
    }

    processBlock(block) {
        console.log(block);
    }

    moveUnconfirmedTransactions(delta) {
        this.transactionObjects.forEach(tx => {
            if (tx.isBeingLookedAt) {
                return;
            }

            tx.userData.velocity.multiplyScalar(1 - (0.0001 * delta));

            tx.position.add(tx.userData.velocity);
            if (tx.position.x < -this.roomSize || tx.position.x > this.roomSize) {
                tx.position.x = THREE.Math.clamp(tx.position.x, -this.roomSize, this.roomSize);
                tx.userData.velocity.x = -tx.userData.velocity.x;
            }

            if (tx.position.y < -this.roomSize || tx.position.y > this.roomSize) {
                tx.position.y = THREE.Math.clamp(tx.position.y, -this.roomSize, this.roomSize);
                tx.userData.velocity.y = -tx.userData.velocity.y;
            }

            if (tx.position.z < -this.roomSize || tx.position.z > this.roomSize) {
                tx.position.z = THREE.Math.clamp(tx.position.z, -this.roomSize, this.roomSize);
                tx.userData.velocity.z = -tx.userData.velocity.z;
            }

            tx.rotation.x += tx.userData.velocity.x * 2 * delta;
            tx.rotation.y += tx.userData.velocity.y * 2 * delta;
            tx.rotation.z += tx.userData.velocity.z * 2 * delta;
        });
    }
}

module.exports = Room;
