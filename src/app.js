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


let coordinates =[];
 coordinates = createWall(100,5,10)

const flacheDaten = coordinates.flat();

const positions = new Float32Array(flacheDaten);

const bufferGeometry = new THREE.BufferGeometry();
bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.001 });

const points = new THREE.Points(bufferGeometry, pointsMaterial);





scene.add(points);




function createWall(pointsCount, width, height) {

    let wall = [];
    let temp = [];
    
    let noise;
    


    for (let x = 0; x < pointsCount; x++) {

        for (let y = 0; y < pointsCount; y++) {
            noise = THREE.MathUtils.randFloat(-0.03, 0.02);
                temp = [(x / (pointsCount - 1))*width, (y / (pointsCount-1))*height, noise];

            wall.push(temp);
        }

    }
    return wall;

}

function animate(time) {

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);