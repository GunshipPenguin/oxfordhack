var THREE = require('three');
var WEBVR = require('./web-vr');
var Room = require('./room');
var blockchainApi = require('./blockchain-api');
var moment = require('moment');

var container;
var camera, scene, renderer;
var clock;
var raycaster;

var room;
var crosshair;

var intersectingItem;

var metaDataFont;
var hudTextMeshes = [];

// Load text
var loader = new THREE.FontLoader();
loader.load('helvetiker_regular.typeface.js', function (font) {
    metaDataFont = font;
    init();
    animate();
});

function clearHud() {
    hudTextMeshes.forEach(mesh => {
        if (mesh) {
            camera.remove(mesh);
        }
    });
    hudTextMeshes = []
}

function addHud(str, xpos, ypos, zpos) {
    var textGeometry = new THREE.TextGeometry(str, {
        font: metaDataFont,

        size: 0.01,
        height: 0.0001,
        curveSegments: 1,
        bevelEnabled: false
    });

    var textMaterial = new THREE.MeshBasicMaterial(
        {color: 0xffffff}
    );

    var textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.x = xpos;
    textMesh.position.y = ypos;
    textMesh.position.z = zpos;
    camera.add(textMesh);

    hudTextMeshes.push(textMesh);
}

function init() {
    clock = new THREE.Clock();
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x505050);

    raycaster = new THREE.Raycaster();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20);
    scene.add(camera);

    crosshair = new THREE.Mesh(
        new THREE.RingBufferGeometry(0.02, 0.04, 32),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 0.5,
            transparent: true
        })
    );
    crosshair.position.z = -2;
    camera.add(crosshair);

    room = new Room(10);

    room.position.y = 3;
    scene.add(room);

    blockchainApi.subscribeToTransactions(t => {
        blocks = room.children;
        room.addUnconfirmedTransaction(t);
    });

    blockchainApi.subscribeToBlocks(b => {
        room.addBlockchainBlock(b);
    });

    var mockBlockchainBlock = {
        x: {
            txIndexes: [
                392277924,
                392276319,
                392277471,
                392275989,
                392277297,
                392277307,
                392277423
            ],
            nTx: 1796,
            height: 551399,
            time: 1543108624
        }
    };
    room.addBlockchainBlock(mockBlockchainBlock);

    scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.vr.enabled = true;
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    window.addEventListener('vrdisplaypointerrestricted', onPointerRestricted, false);
    window.addEventListener('vrdisplaypointerunrestricted', onPointerUnrestricted, false);

    document.body.appendChild(WEBVR.createButton(renderer));
}

function onPointerRestricted() {
    var pointerLockElement = renderer.domElement;
    if (pointerLockElement && typeof (pointerLockElement.requestPointerLock) === 'function') {
        pointerLockElement.requestPointerLock();
    }
}

function onPointerUnrestricted() {
    var currentPointerLockElement = document.pointerLockElement;
    var expectedPointerLockElement = renderer.domElement;
    if (currentPointerLockElement && currentPointerLockElement === expectedPointerLockElement && typeof (document.exitPointerLock) === 'function') {
        document.exitPointerLock();
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    var delta = clock.getDelta() * 60;

    // Find intersecting block
    raycaster.setFromCamera({x: 0, y: 0}, camera);

    var txBlocks = room.children.filter(obj => obj.isUnconfirmedTransaction || obj.isBlockchainBlock);
    var intersects = raycaster.intersectObjects(txBlocks);

    if (intersects.length > 0) {
        var distance = intersects[0].object.position.distanceTo(camera.position);
        if (intersectingItem !== intersects[0].object && distance >= 3) {
            if (intersectingItem !== undefined) {
                intersectingItem.material.emissive.setHex(intersectingItem.currentHex);
                intersectingItem.isBeingLookedAt = false;
            }

            intersectingItem = intersects[0].object;
            intersectingItem.isBeingLookedAt = true;
            if (hudTextMeshes.length !== 0) {
                clearHud();
            }

            if (intersectingItem.isUnconfirmedTransaction) {
                addHud('TX Hash: ' + intersectingItem.txInfo.x.hash.substr(0, 12) + '...', -0.1, -0.06, -0.25);
                addHud('Est. Amount (mBTC): ' + Number(intersectingItem.getEstimatedAmount() * 10e-5).toFixed(3), -0.1, -0.035, -0.25);
                addHud('Est. Amount (GBP) ' + intersectingItem.getEstimatedAmountGBP().toFixed(2), -0.1, -0.01, -0.25);
                addHud('Broadcast: ' + moment(intersectingItem.txInfo.x.time * 1000).fromNow(), -0.1, 0.015, -0.25);
            } else {
                addHud('nTx: ' + intersectingItem.blockInfo.x.nTx, -0.1, -0.06, -0.25);
                addHud('Height: ' + intersectingItem.blockInfo.x.height, -0.1, -0.035, -0.25);
                addHud('Confirmed: ' + moment(intersectingItem.blockInfo.x.time * 1000).fromNow(), -0.1, -0.01, -0.25);
            }

            intersectingItem.currentHex = intersectingItem.material.emissive.getHex();
            intersectingItem.material.emissive.setHex(0xff0000);
        }
    } else {
        if (intersectingItem) {
            intersectingItem.material.emissive.setHex(intersectingItem.currentHex);
        }

        if (hudTextMeshes.length !== 0) {
            clearHud();
        }

        if (intersectingItem) {
            intersectingItem.isBeingLookedAt = false;
            intersectingItem = undefined;
        }
    }

    room.moveUnconfirmedTransactions(delta);
    room.moveBlockchainBlocks(delta);
    renderer.render(scene, camera);
}
