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

// Accent Color Light (Green)
const accentLight = new THREE.PointLight(0x00ff88, 30, 50);
accentLight.position.set(-5, 5, 5);
scene.add(accentLight);

// Secondary Green Light
const secondaryLight = new THREE.PointLight(0x00cc66, 30, 50);
secondaryLight.position.set(5, -5, 5);
scene.add(secondaryLight);

// Deep Blue Fill
const fillLight = new THREE.PointLight(0x0055ff, 20, 50);
fillLight.position.set(0, 5, -5);
scene.add(fillLight);

// --- Electronic Circuit Board ---
const circuitGroup = new THREE.Group();

// 1. PCB Base
const pcbGeometry = new THREE.BoxGeometry(3.5, 0.05, 2.5);
const pcbMaterial = new THREE.MeshStandardMaterial({
    color: 0x003311, // Dark green PCB
    roughness: 0.7,
    metalness: 0.2
});
const pcb = new THREE.Mesh(pcbGeometry, pcbMaterial);
circuitGroup.add(pcb);

// 2. Main Microcontroller Chip
const mcuGeometry = new THREE.BoxGeometry(1.2, 0.1, 1.2);
const icMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111, // Dark grey/black
    roughness: 0.6,
    metalness: 0.4
});
const mcu = new THREE.Mesh(mcuGeometry, icMaterial);
mcu.position.set(0, 0.075, 0); // slightly above PCB
circuitGroup.add(mcu);

// Add pins to MCU
const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 });
const pinGeo = new THREE.BoxGeometry(0.04, 0.15, 0.08);
for (let i = 0; i < 8; i++) {
    const offset = -0.525 + i * 0.15;
    // Top
    const pinT = new THREE.Mesh(pinGeo, pinMaterial);
    pinT.position.set(offset, 0.05, -0.6);
    circuitGroup.add(pinT);
    // Bottom
    const pinB = new THREE.Mesh(pinGeo, pinMaterial);
    pinB.position.set(offset, 0.05, 0.6);
    circuitGroup.add(pinB);
    // Left
    const pinL = new THREE.Mesh(pinGeo, pinMaterial);
    pinL.rotation.y = Math.PI / 2;
    pinL.position.set(-0.6, 0.05, offset);
    circuitGroup.add(pinL);
    // Right
    const pinR = new THREE.Mesh(pinGeo, pinMaterial);
    pinR.rotation.y = Math.PI / 2;
    pinR.position.set(0.6, 0.05, offset);
    circuitGroup.add(pinR);
}

// 3. Header Pins
const headerHousingGeo = new THREE.BoxGeometry(0.2, 0.15, 1.5);
const headerHousingMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const header = new THREE.Mesh(headerHousingGeo, headerHousingMat);
header.position.set(1.4, 0.1, 0);
circuitGroup.add(header);

const headerPinGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
const headerPinMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 1, roughness: 0.3 }); // Gold pins
for (let i = 0; i < 10; i++) {
    const pin = new THREE.Mesh(headerPinGeo, headerPinMat);
    pin.position.set(1.4, 0.15, -0.675 + i * 0.15);
    circuitGroup.add(pin);
}

// 4. Smaller ICs
const smallIcGeo = new THREE.BoxGeometry(0.4, 0.08, 0.6);
const smallIc1 = new THREE.Mesh(smallIcGeo, icMaterial);
smallIc1.position.set(-1.2, 0.065, 0.5);
circuitGroup.add(smallIc1);

const smallIc2 = new THREE.Mesh(smallIcGeo, icMaterial);
smallIc2.position.set(-1.2, 0.065, -0.5);
circuitGroup.add(smallIc2);

// 5. Capacitors (Cylinders)
const capGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.3);
const capMat = new THREE.MeshStandardMaterial({ color: 0x111166, roughness: 0.4, metalness: 0.6 }); // Dark blue caps
const capTopMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8 }); // Silver top

const createCapacitor = (x, z) => {
    const cap = new THREE.Group();
    const body = new THREE.Mesh(capGeo, capMat);
    body.position.y = 0.15;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.101, 0.101, 0.05), capTopMat);
    top.position.y = 0.28;
    cap.add(body);
    cap.add(top);
    cap.position.set(x, 0.025, z);
    circuitGroup.add(cap);
};

createCapacitor(-0.5, 0.8);
createCapacitor(-0.2, 0.8);
createCapacitor(0.8, -0.8);

// 6. Glowing LED
const ledGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const ledMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 2 });
const led = new THREE.Mesh(ledGeo, ledMat);
led.position.set(0.8, 0.075, 0.8);
circuitGroup.add(led);
let pulseLed = led;

// 7. Decorative Traces (Lines on the board)
const traceMat = new THREE.LineBasicMaterial({ color: 0x00aa55 });
const addTrace = (points) => {
    const p3d = points.map(p => new THREE.Vector3(p[0], 0.03, p[1]));
    const geo = new THREE.BufferGeometry().setFromPoints(p3d);
    const trace = new THREE.Line(geo, traceMat);
    circuitGroup.add(trace);
};

addTrace([[-1.2, 0.2], [-0.8, 0.2], [-0.6, 0]]);
addTrace([[-1.2, 0.8], [-1.0, 0.8], [-0.6, 0.4], [-0.6, 0.2]]);
addTrace([[0.6, 0.2], [0.8, 0.4], [1.2, 0.4]]);
addTrace([[0.6, -0.2], [1.0, -0.2], [1.2, -0.4]]);
addTrace([[-0.2, -0.6], [-0.2, -0.8], [-0.8, -0.8]]);

scene.add(circuitGroup);

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
let cumulativeSpin = 0;
window.sceneState = { isSpinning: true, isTracesVisible: true, currentLedColorIdx: 0 };

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Rotation based on mouse
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;

    // Continuous rotation + mouse offset
    if (window.sceneState.isSpinning) {
        cumulativeSpin += delta * 0.5;
    }
    circuitGroup.rotation.y = cumulativeSpin + targetX;
    circuitGroup.rotation.x = 0.5 + targetY; // Base tilt of 0.5 rad

    // Pulse LED
    if (typeof pulseLed !== 'undefined') {
        pulseLed.material.emissiveIntensity = 1.5 + Math.sin(time * 5);
    }

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

// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu when clicking on a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Flashlight Cursor Effect for Glass Cards
document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Boot Sequence Preloader & Hero Subtitle Typewriter
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById('preloader');
    const termText = document.getElementById('terminal-text');

    // --- Trilingual Language Toggle ---
    const langToggle = document.getElementById('langToggle');
    const languages = ['en', 'he', 'ar'];
    let currentLangIdx = 0;

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLangIdx = (currentLangIdx + 1) % languages.length;
            const nextLang = languages[currentLangIdx];
            document.body.classList.remove('lang-mode-en', 'lang-mode-he', 'lang-mode-ar', 'rtl-mode');
            document.body.classList.add(`lang-mode-${nextLang}`);
            if (nextLang === 'he' || nextLang === 'ar') {
                document.body.classList.add('rtl-mode');
            }
        });
    }

    // 1. Boot Sequence Logic
    const bootLines = [
        "KERNEL LOADED...",
        "INITIALIZING HARDWARE SYSTEMS... [OK]",
        "COMPILING C++ FIRMWARE... [OK]",
        "MOUNTING VIRTUAL FILESYSTEM... [OK]",
        "ACTIVATING 3D ENVIRONMENT..."
    ];

    let lineIdx = 0;

    function showNextBootLine() {
        if (lineIdx < bootLines.length) {
            const p = document.createElement('div');
            p.innerText = "> " + bootLines[lineIdx];
            termText.appendChild(p);
            lineIdx++;
            setTimeout(showNextBootLine, Math.random() * 350 + 100);
        } else {
            // Boot sequence done, fade out preloader
            setTimeout(() => {
                if (preloader) preloader.classList.add('fade-out');
                // Show language panel after boot
                const langPanel = document.getElementById('langControlPanel');
                if (langPanel) langPanel.classList.add('visible');
                // Trigger Hero typewriter slightly after fading out starts
                setTimeout(startHeroTypewriter, 400);
            }, 600);
        }
    }

    // 2. Hero Subtitle Typewriter Logic
    function startHeroTypewriter() {
        const typewriter = document.querySelector('.hero .subtitle');
        if (typewriter) {
            const textToType = "Exploring the Future of Hardware & Systems"; // From HTML
            typewriter.innerText = '';

            let i = 0;
            typewriter.innerHTML = '<span class="typewriter-cursor blink-cursor">_</span>';

            function type() {
                if (i < textToType.length) {
                    typewriter.innerHTML = textToType.substring(0, i + 1) + '<span class="typewriter-cursor blink-cursor">_</span>';
                    i++;
                    const speed = Math.random() * (100 - 40) + 40;
                    setTimeout(type, speed);
                } else {
                    typewriter.innerHTML = textToType + '<span class="typewriter-cursor blink-cursor">_</span>';
                }
            }
            type();
        }
    }

    // Kick off the boot sequence immediately
    if (termText) {
        setTimeout(showNextBootLine, 200);
    } else { // fallback if preloader isn't found
        startHeroTypewriter();
    }
});

// -- Scroll Reveal Interactions --
document.addEventListener("DOMContentLoaded", () => {
    // Dynamically assign reveal class just in case to ensure coverage
    document.querySelectorAll('.timeline-item, .skill-category, .section-header').forEach(el => el.classList.add('reveal'));

    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -50px 0px", threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
});

// -- 3D HUD Controls --
const ledColors = [0x00ff88, 0xff0055, 0x00aaff, 0xffdd00];

document.getElementById('btn-spin')?.addEventListener('click', () => {
    window.sceneState.isSpinning = !window.sceneState.isSpinning;
});

document.getElementById('btn-led')?.addEventListener('click', () => {
    window.sceneState.currentLedColorIdx = (window.sceneState.currentLedColorIdx + 1) % ledColors.length;
    const newColor = ledColors[window.sceneState.currentLedColorIdx];
    if (typeof ledMat !== 'undefined') {
        ledMat.color.setHex(newColor);
        ledMat.emissive.setHex(newColor);
    }
});

document.getElementById('btn-traces')?.addEventListener('click', () => {
    window.sceneState.isTracesVisible = !window.sceneState.isTracesVisible;
    if (typeof traceMat !== 'undefined') {
        traceMat.visible = window.sceneState.isTracesVisible;
    }
});

// -- Back to Top Button --
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
