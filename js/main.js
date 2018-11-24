var THREE = require('three');
var WEBVR = require('./web-vr');
var Room = require('./room');
var blockchainApi = require('./blockchain-api');

var container;
var camera, scene, renderer;
var clock;

var room;
var crosshair;

init();
animate();

function init() {
    clock = new THREE.Clock();
    container = document.createElement('div');
    document.body.appendChild(container);

    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '<a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - interactive cubes';
    container.appendChild(info);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x505050);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
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

    room = new Room(4);

    room.position.y = 3;
    scene.add(room);

    blockchainApi.subscribeToTransactions(t => {
        console.log(t);
        room.addUnconfirmedTransaction(t);
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

    room.moveUnconfirmedTransactions(delta);
    renderer.render(scene, camera);
}

//-------------------------------

function buildBlock(transactionIDs)
{
	for (var i = 0; i < transactionIDs.length; i++)
	{
		var box = findBox(transactionsIDs[i])
		moveBox(box)
	}
}

// function findBox(boxID){

// 	for (box in boxes) 
// 		if (box.id = boxID)
// 			 return box

// }

//-------------------------------

var transactionConnection = new WebSocket('wss://ws.blockchain.info/inv');
var transactionData = {"op":"unconfirmed_sub"};
var blockConnection = new WebSocket('wss://ws.blockchain.info/inv');
var blockData = {"op":"blocks_sub"};
var transactions = [];
transactionConnection.onopen = function()
{
	transactionConnection.send(JSON.stringify(transactionData)) 
};
transactionConnection.onerror = function (error)
{
	console.log('WebSocket Error' + error)
};
transactionConnection.onmessage = function(e)
{
	transaction = JSON.parse(e.data).x
	transactions.push(transaction.tx_index)
};
blockConnection.onopen = function()
{
	blockConnection.send(JSON.stringify(blockData)) 
};
blockConnection.onerror = function (error)
{
	console.log('WebSocket Error' + error)
};
blockConnection.onmessage = function(e)
{
	block = JSON.parse(e.data).x
	for (var i=0; i<block.txIndexes.length; ++i)
	{
		if (transactions[i] in block.txIndexes)
		{
			transactions.pop(transactions[i])
		}
	}
	buildBlock(transactions)
};


