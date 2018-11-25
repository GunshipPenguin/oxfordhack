var THREE = require('three');
var UnconfirmedTransactionMesh = require('./unconfirmed-transaction-mesh');
var ConfirmedTransaction = require('./blockchain-block')

BTC_SCALE = 0.40;
SCALE_CAP = 15.0;

const chainX = 0.04;
const chainY = 0.05;
const blockSize = 1;

function randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Room extends THREE.Object3D {
    constructor(roomSize) {
        super();
        this.roomSize = roomSize;
        this.chainZ = -roomSize;
    }

    addConfirmedTransaction() {
        var newBlock = new ConfirmedTransaction(blockSize);

        newBlock.position.x = chainX;
        newBlock.position.y = chainY;
        newBlock.position.z = this.chainZ;

        newBlock.userData.velocity = new THREE.Vector3();
        newBlock.userData.velocity.x = 0;
        newBlock.userData.velocity.y = 0;
        newBlock.userData.velocity.z = 0;

        newBlock.rotation.x = 0;
        newBlock.rotation.y = 0;
        newBlock.rotation.z = 0;

        newBlock.scale.x = 0.5; //Math.max((Math.random() + 0.5) * (estAmount / BTC_SCALE), SCALE_CAP);
        newBlock.scale.y = 0.5;
        newBlock.scale.z = 0.5; //Math.max((Math.random() + 0.5) * (estAmount / BTC_SCALE), SCALE_CAP);

        this.chainZ += blockSize + 0.03;

        this.add(newBlock);

        this.initializeSkybox();
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

        newTx.scale.x = Math.min((Math.random() / 2 + 0.5) * (estAmount / BTC_SCALE), SCALE_CAP);
        newTx.scale.y = Math.min((Math.random() / 2 + 0.5) * (estAmount / BTC_SCALE), SCALE_CAP);
        newTx.scale.z = Math.min((Math.random() / 2 + 0.5) * (estAmount / BTC_SCALE), SCALE_CAP);

        newTx.userData.velocity = new THREE.Vector3();
        newTx.userData.velocity.x = Math.random() * 0.02 - 0.005;
        newTx.userData.velocity.y = Math.random() * 0.02 - 0.005;
        newTx.userData.velocity.z = Math.random() * 0.02 - 0.005;

        this.add(newTx);
    }

    initializeSkybox() {
        var geometry = new THREE.CubeGeometry(this.roomSize * 2, this.roomSize * 2, this.roomSize * 2);
        var skyboxMaterials = [
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('img/matrix1.png'),
                side: THREE.DoubleSide
            }), //front side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('img/matrix2.png'),
                side: THREE.DoubleSide
            }), //back side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('img/black.png'),
                side: THREE.DoubleSide
            }), //up side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('img/black.png'),
                side: THREE.DoubleSide
            }), //down side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('img/matrix3.png'),
                side: THREE.DoubleSide
            }), //right side
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('img/matrix4.png'),
                side: THREE.DoubleSide
            }), //left side
        ];

        var skyboxMaterial = new THREE.MeshFaceMaterial(skyboxMaterials);
        var skybox = new THREE.Mesh(geometry, skyboxMaterial);
        this.add(skybox);
    }

    processBlock(block) {
        var txIndexes = block.x.txIndexes;
        this.children.forEach(child => {

            if (child.userData.velocity !== 0)
                child.userData.velocity.multiplyScalar(1 - (0.0001 * delta));

            if (!child.txInfo) {
                return;
            }

            if (txIndexes.includes(child.txInfo.x.tx_index)) {
                this.remove(child);
                console.log('Removing ' + child.txInfo.x.tx_index);
            }
        });
    }

    moveUnconfirmedTransactions(delta) {
        this.children.forEach(child => {
            if (!child.txInfo) {
                return;
            }

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
