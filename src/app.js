import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject, OrbitControls } from 'three/examples/jsm/Addons.js';
import { addNormal, createWall, here, kdTree, searchInKdTree } from './alghorithms.js';
import { ladePunktwolke } from './simulations.js';



async function initScene() {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const backgroundColor = new THREE.Color('black');
    scene.background = backgroundColor;
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 10;


    let coordinatesWall = [];
    coordinatesWall = createWall(100, 5, 10)
    let myTree = kdTree(coordinatesWall);
    const flacheDaten = coordinatesWall.flat();
    let coordinatesHaltestelle = [];
    coordinatesHaltestelle = await ladePunktwolke('../src/Haltestelle.txt');
    let myTreeHaltestelle = kdTree(coordinatesHaltestelle);
    const flacheDatenHaltestelle = coordinatesHaltestelle.flat();
    const TargetPoint = [1.3, 3.7, 0];
    const search = searchInKdTree(TargetPoint, myTree, 90);
    //console.log(search);
    const normale = addNormal(search);
    const wallPositions = new Float32Array(flacheDaten);
    const haltestellePositions = new Float32Array(flacheDatenHaltestelle);

    const targetPointPosition = new Float32Array(TargetPoint);
    const flatNeighborCoordinates = search.map(item => item.point).flat();
    const neighborPositions = new Float32Array(flatNeighborCoordinates);
    const neighborPointsGeometry = new THREE.BufferGeometry();
    const wallGeometry = new THREE.BufferGeometry();
    const haltestelleGeometry = new THREE.BufferGeometry();

    const targetPointGeometry = new THREE.BufferGeometry();
    targetPointGeometry.setAttribute('position', new THREE.BufferAttribute(targetPointPosition, 3));
    wallGeometry.setAttribute('position', new THREE.BufferAttribute(wallPositions, 3));
    haltestelleGeometry.setAttribute('position', new THREE.BufferAttribute(haltestellePositions, 3));

    neighborPointsGeometry.setAttribute('position', new THREE.BufferAttribute(neighborPositions, 3));

    const neighborPointsMaterial = new THREE.PointsMaterial({ color: 0xDBFA93, size: 0.05 });
    const wallMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.01 });
    const haltestelleMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.01 });

    const targetPointMaterial = new THREE.PointsMaterial({ color: 0x00FFA9, size: 0.05 });
    const targetPoint = new THREE.Points(targetPointGeometry, targetPointMaterial);
    const wallPoints = new THREE.Points(wallGeometry, wallMaterial);
    const haltestellePoints = new THREE.Points(haltestelleGeometry, haltestelleMaterial);

    const neighborPoints = new THREE.Points(neighborPointsGeometry, neighborPointsMaterial);

    const normalStart = new THREE.Vector3(...normale.centerPoint);
    const normalEnd = normalStart.clone().add(
        new THREE.Vector3(...normale.normal).multiplyScalar(6)
    );

    console.log(normale.covarianceMatrix);
    const normalGeometry = new THREE.BufferGeometry().setFromPoints([
        normalStart,
        normalEnd
    ]);
    const normalMaterial = new THREE.LineBasicMaterial({ color: 0x800080 });
    const normalLine = new THREE.Line(normalGeometry, normalMaterial);

    //console.log(myTree.left.left.left.point);



    scene.add(neighborPoints);
    scene.add(targetPoint);
    // scene.add(wallPoints);
    scene.add(normalLine);
    scene.add(haltestellePoints);

    function animate(time) {

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

}


await initScene();
