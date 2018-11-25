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

var intersectedBox;

var metaDataFont;
var hudTextMeshes = [];

// Load text
var loader = new THREE.FontLoader();
loader.load( 'helvetiker_regular.typeface.js', function ( font ) {
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
        room.addUnconfirmedTransaction(t);
    });

    blockchainApi.subscribeToBlocks(b => {
        room.processBlock(b);
    });

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
    var intersects = raycaster.intersectObjects(room.children);
    if (intersects.length > 0) {
        if (intersectedBox !== intersects[0].object) {
            if (intersectedBox !== undefined) {
                intersectedBox.material.emissive.setHex(intersectedBox.currentHex);
                intersectedBox.isBeingLookedAt = false;
            }

            intersectedBox = intersects[0].object;
            intersectedBox.isBeingLookedAt = true;
            if (hudTextMeshes.length !== 0) {
                clearHud();
            }

            addHud('TX Hash: ' + intersectedBox.txInfo.x.hash.substr(0, 3) + '...', -0.1, -0.06, -0.25);
            addHud('Est. Amount (mBTC): ' + Number(intersectedBox.getEstimatedAmount()*10e-5).toFixed(3), -0.1, -0.035, -0.25);
            addHud('Est. Amount (GBP) ' + intersectedBox.getEstimatedAmountGBP().toFixed(2), -0.1, -0.01, -0.25);
            addHud('Broadcast: ' + moment(intersectedBox.txInfo.x.time*1000).fromNow(), -0.1, 0.015, -0.25);
            intersectedBox.currentHex = intersectedBox.material.emissive.getHex();
            intersectedBox.material.emissive.setHex(0xff0000);
        }
    } else {
        if (intersectedBox) {
            intersectedBox.material.emissive.setHex(intersectedBox.currentHex);
        }

        if (hudTextMeshes.length !== 0) {
            clearHud();
        }

        if (intersectedBox) {
            intersectedBox.isBeingLookedAt = false;
            intersectedBox = undefined;
        }
    }



    room.moveUnconfirmedTransactions(delta);
    renderer.render(scene, camera);
}
