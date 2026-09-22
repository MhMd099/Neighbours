import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject, OrbitControls } from 'three/examples/jsm/Addons.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const backgroundColor = new THREE.Color('black');
scene.background = backgroundColor;
const orbitControls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 10;


let coordinates = [];
coordinates = createWall(100, 5, 10)
let myTree = kdTree(coordinates);
const flacheDaten = coordinates.flat();
const point = [1.3,3.7,0];
const search = searchInKdTree(point,myTree,6);
console.log(search);

const positions = new Float32Array(flacheDaten);
const positions2 = new Float32Array(point);
const gefundenePunkteFlach = search.map(item => item.point).flat();
const n = new Float32Array(gefundenePunkteFlach);
const bufferGeometryn = new THREE.BufferGeometry();
const bufferGeometry = new THREE.BufferGeometry();
const bufferGeometry2 = new THREE.BufferGeometry();
bufferGeometry2.setAttribute('position', new THREE.BufferAttribute(positions2,3));
bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
bufferGeometryn.setAttribute('position', new THREE.BufferAttribute(n,3));
const nMaterial = new THREE.PointsMaterial({ color:0xDBFA93, size : 0.05});
const pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.01 });
const pointsMaterial2 = new THREE.PointsMaterial({color: 0x00FFA9, size: 0.05});
const points2 = new THREE.Points(bufferGeometry2,pointsMaterial2);
const points = new THREE.Points(bufferGeometry, pointsMaterial);
const searchs = new THREE.Points(bufferGeometryn,nMaterial);


//console.log(myTree.left.left.left.point);

scene.add(searchs);
scene.add(points2);
scene.add(points);




function createWall(pointsCount, width, height) {

    let wall = [];
    let temp = [];

    let noise = 0;



    for (let x = 0; x < pointsCount; x++) {

        for (let y = 0; y < pointsCount; y++) {
          noise = THREE.MathUtils.randFloat(-0.03, 0.02);
            temp = [(x / (pointsCount - 1)) * width, (y / (pointsCount - 1)) * height, noise];

            wall.push(temp);
        }

    }
    return wall;

}
function kdTree(wall, depth = 0) {

    if (!wall || wall.length === 0) return null;
    const axis = depth % 3;
    const sorted = wall.toSorted((a, b) => a[axis] - b[axis]);

    const medianIndex = Math.floor((sorted.length) / 2);
    const nodePoint = sorted[medianIndex];

    return {
        point: nodePoint,
        left: kdTree(sorted.slice(0, medianIndex), depth + 1),
        right: kdTree(sorted.slice(medianIndex + 1), depth + 1)
    }



}
function searchInKdTree(target, node, depth = 0, k = 9999, neighbors = []) {
    if (node === null) return neighbors;

    const dx = target[0] - node.point[0];
    const dy = target[1] - node.point[1];
    const dz = target[2] - node.point[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    neighbors.push({ point: node.point, distance: distance });

    neighbors.sort((a, b) => a.distance - b.distance);

    if (neighbors.length > k) {
        neighbors.pop();
    }

    const axis = depth % 3;
    const isBacktracingLeft = target[axis] < node.point[axis];
    const secondaryNode = isBacktracingLeft ? node.right : node.left;
    const primaryNode = isBacktracingLeft ? node.left : node.right;

    searchInKdTree(target,primaryNode,depth + 1, k, neighbors);
  const planeDistance = Math.abs(target[axis] - node.point[axis]);


    const worstDistance = neighbors[neighbors.length - 1].distance;

    if (neighbors.length < k || planeDistance < worstDistance) {
        searchInKdTree(target, secondaryNode, depth + 1, k, neighbors);


    }



    return neighbors;
}


function animate(time) {

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);