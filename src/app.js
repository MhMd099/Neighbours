import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject, OrbitControls } from 'three/examples/jsm/Addons.js';
import { EigenvalueDecomposition, Matrix } from 'ml-matrix';


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
const TargetPoint = [1.3, 3.7, 0];
const search = searchInKdTree(TargetPoint, myTree, 90);
//console.log(search);
const normale = addNormal(search);
const wallPositions = new Float32Array(flacheDaten);
const targetPointPosition = new Float32Array(TargetPoint);
const flatNeighborCoordinates = search.map(item => item.point).flat();
const neighborPositions = new Float32Array(flatNeighborCoordinates);
const neighborPointsGeometry = new THREE.BufferGeometry();
const wallGeometry = new THREE.BufferGeometry();
const targetPointGeometry = new THREE.BufferGeometry();
targetPointGeometry.setAttribute('position', new THREE.BufferAttribute(targetPointPosition, 3));
wallGeometry.setAttribute('position', new THREE.BufferAttribute(wallPositions, 3));
neighborPointsGeometry.setAttribute('position', new THREE.BufferAttribute(neighborPositions, 3));

const neighborPointsMaterial = new THREE.PointsMaterial({ color: 0xDBFA93, size: 0.05 });
const wallMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.01 });
const targetPointMaterial = new THREE.PointsMaterial({ color: 0x00FFA9, size: 0.05 });
const targetPoint = new THREE.Points(targetPointGeometry, targetPointMaterial);
const wallPoints = new THREE.Points(wallGeometry, wallMaterial);
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
scene.add(wallPoints);
scene.add(normalLine);
function createWall(pointsCount, width, height) {

    let wall = [];
    let temp = [];

    let noise = 0;



    for (let x = 0; x < pointsCount; x++) {

        for (let y = 0; y < pointsCount; y++) {
            noise = THREE.MathUtils.randFloat(-0.0, 0.02);
            temp = [(x / (pointsCount - 1)) * width, (y / (pointsCount - 1)) * height, noise];

            wall.push(temp);
        }

    }
    return wall;

}
function kdTree(wall, depth = 0) {

    if (!wall || wall.length === 0) return null;
    const axis = depth % 3;
    //Sortiert die Punkte aufsteigend nach den Achsen
    //Am Anfang ist die X-Achse betroffen 
    const sorted = wall.toSorted((a, b) => a[axis] - b[axis]);
    //Median von den sortierten Punkten nach [axis] bestimmen
    const medianIndex = Math.floor((sorted.length) / 2);
    //Den Wert des Medians holen
    const nodePoint = sorted[medianIndex];

    return {
        // Ein Objekt mit dem Median und die "benachbarten" Punkten erstellen
        point: nodePoint,
        //                   Schneidet alles bis zum Index des Medians ab
        //                      ohne depth + 1 wandert er nicht zur nächsten Achse (Y) usw..
        left: kdTree(sorted.slice(0, medianIndex), depth + 1),
        right: kdTree(sorted.slice(medianIndex + 1), depth + 1)
    }
}



function searchInKdTree(target, node, depth = 0, k = 20, neighbors = []) {
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
    searchInKdTree(target, primaryNode, depth + 1, k, neighbors);
    const planeDistance = Math.abs(target[axis] - node.point[axis]);
    const worstDistance = neighbors[neighbors.length - 1].distance;
    if (neighbors.length < k || planeDistance < worstDistance) {
        searchInKdTree(target, secondaryNode, depth + 1, k, neighbors);
    }
    return neighbors;
}

function addNormal(neighbors = []) {
    const N = neighbors.length;
    if (N < 3) return null;

    // ---------------------------------
    // SCHRITT 1: Schwerpunkt berechnen
    // ---------------------------------
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;

    for (let i = 0; i < N; i++) {
        sumX += neighbors[i].point[0];
        sumY += neighbors[i].point[1];
        sumZ += neighbors[i].point[2];
    }

    const centerX = sumX / N;
    const centerY = sumY / N;
    const centerZ = sumZ / N;

    // ---------------------------------
    // SCHRITT 2: Punkte um Schwerpunkt
    // verschieben
    // ---------------------------------
    let cXX = 0;
    let cXY = 0;
    let cXZ = 0;

    let cYY = 0;
    let cYZ = 0;
    let cZZ = 0;

    for (let i = 0; i < N; i++) {
        const x = neighbors[i].point[0] - centerX;
        const y = neighbors[i].point[1] - centerY;
        const z = neighbors[i].point[2] - centerZ;

        // ---------------------------------
        // SCHRITT 3: Kovarianz sammeln
        // ---------------------------------
        cXX += x * x;
        cXY += x * y;
        cXZ += x * z;

        cYY += y * y;
        cYZ += y * z;

        cZZ += z * z;
    }

    // ---------------------------------
    // SCHRITT 4: Durch N teilen
    // ---------------------------------
    const covarianceMatrix = new Matrix([
        [cXX / N, cXY / N, cXZ / N],
        [cXY / N, cYY / N, cYZ / N],
        [cXZ / N, cYZ / N, cZZ / N]
    ]);

    // ---------------------------------
    // SCHRITT 5:
    // Eigenwerte + Eigenvektoren
    // ---------------------------------
    const evd = new EigenvalueDecomposition(covarianceMatrix);
    const eigenvalues = evd.realEigenvalues;
    const eigenvectors = evd.eigenvectorMatrix;

    // ---------------------------------
    // SCHRITT 6:
    // kleinsten Eigenwert suchen
    // ---------------------------------
    let minIndex = 0;

    for (let i = 1; i < eigenvalues.length; i++) {
        if (eigenvalues[i] < eigenvalues[minIndex]) {
            minIndex = i;
        }
    }

    // ---------------------------------
    // SCHRITT 7:
    // zugehörigen Eigenvektor holen
    // ---------------------------------
    let nx = eigenvectors.get(0, minIndex);
    let ny = eigenvectors.get(1, minIndex);
    let nz = eigenvectors.get(2, minIndex);

    // ---------------------------------
    // SCHRITT 8:
    // Normalenvektor ist normalerweise
    // bereits Länge 1.
    // Sicherheitshalber normalisieren.
    // ---------------------------------
    const length = Math.sqrt(
        nx * nx +
        ny * ny +
        nz * nz
    );

    nx /= length;
    ny /= length;
    nz /= length;
    if (nz < 0) {
        nz = nz * (-1);
    }

    return {
        centerPoint: [centerX, centerY, centerZ],

        covarianceMatrix: covarianceMatrix.to2DArray(),
        normal: [nx, ny, nz]
    };
}


function animate(time) {

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);