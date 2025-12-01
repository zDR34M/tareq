import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { createNoise3D } from 'https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js';

// Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
// Deep space fog
scene.fog = new THREE.FogExp2(0x000000, 0.03);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// Lighting - Matches Website Theme (Cyan/Blue)
const ambientLight = new THREE.AmbientLight(0x111111, 2);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(10, 10, 10);
scene.add(mainLight);

// Accent Color Light (Cyan)
const accentLight = new THREE.PointLight(0x00f2ff, 30, 50);
accentLight.position.set(-5, 5, 5);
scene.add(accentLight);

// Secondary Blue Light
const secondaryLight = new THREE.PointLight(0x00c3ff, 30, 50);
secondaryLight.position.set(5, -5, 5);
scene.add(secondaryLight);

// Deep Blue Fill
const fillLight = new THREE.PointLight(0x0055ff, 20, 50);
fillLight.position.set(0, 5, -5);
scene.add(fillLight);

// Liquid Object
const geometry = new THREE.IcosahedronGeometry(1.5, 20); // High detail for smooth waves
const originalPositions = geometry.attributes.position.array.slice(); // Clone original positions

const material = new THREE.MeshPhysicalMaterial({
    color: 0x00f2ff, // Slight cyan tint
    emissive: 0x006167, // Deep blue glow
    emissiveIntensity: 0.2,
    metalness: 0.2,
    roughness: 0,
    transmission: 1,
    thickness: 2,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0,
    side: THREE.DoubleSide,
    envMapIntensity: 1,
    iridescence: 0.5,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 400]
});

const liquidSphere = new THREE.Mesh(geometry, material);
scene.add(liquidSphere);

// Background Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Noise Setup
const noise3D = createNoise3D();
const noiseScale = 0.8;
const noiseSpeed = 0.5;
const displacementScale = 0.4;

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

// Animation
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Liquid Wave Animation
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromArray(originalPositions, i * 3);

        // Calculate noise based on vertex position and time
        const noiseValue = noise3D(
            vertex.x * noiseScale + time * noiseSpeed,
            vertex.y * noiseScale + time * noiseSpeed,
            vertex.z * noiseScale + time * noiseSpeed
        );

        // Displace vertex along its normal (which is just its normalized position for a sphere)
        vertex.normalize().multiplyScalar(1.5 + noiseValue * displacementScale);

        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry.computeVertexNormals(); // Critical for correct lighting on waves
    positionAttribute.needsUpdate = true;

    // Rotation based on mouse
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;

    liquidSphere.rotation.y += 0.002;
    liquidSphere.rotation.x += (targetY - liquidSphere.rotation.x) * 0.05;
    liquidSphere.rotation.y += (targetX - liquidSphere.rotation.y) * 0.05;

    // Particles rotation
    particlesMesh.rotation.y = -time * 0.05;
    particlesMesh.rotation.x = time * 0.02;

    renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
