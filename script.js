import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { createNoise3D } from 'https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js';

/* ═══════════════════════════════════════════════════════════
   THREE.JS — 3D CIRCUIT BOARD BACKGROUND
═══════════════════════════════════════════════════════════ */

const container = document.getElementById('canvas-container');
const scene     = new THREE.Scene();
scene.fog       = new THREE.FogExp2(0x000000, 0.025);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4.5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace  = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

/* — Lighting (Neon Cyan / Electric Blue palette) — */
scene.add(new THREE.AmbientLight(0x111118, 2.5));

const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
mainLight.position.set(10, 10, 10);
scene.add(mainLight);

const cyanLight = new THREE.PointLight(0x00d4ff, 35, 60);
cyanLight.position.set(-5, 5, 5);
scene.add(cyanLight);

const blueLight = new THREE.PointLight(0x0055ff, 25, 60);
blueLight.position.set(5, -4, 4);
scene.add(blueLight);

const rimLight = new THREE.PointLight(0x004080, 15, 50);
rimLight.position.set(0, 6, -5);
scene.add(rimLight);

/* — Circuit Board Group — */
const circuitGroup = new THREE.Group();

// PCB Base
const pcbGeo = new THREE.BoxGeometry(3.6, 0.05, 2.6);
const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x002233, roughness: 0.65, metalness: 0.25
});
circuitGroup.add(new THREE.Mesh(pcbGeo, pcbMat));

// MCU Chip
const icMat = new THREE.MeshStandardMaterial({ color: 0x0d0d12, roughness: 0.55, metalness: 0.5 });
const mcu   = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 1.2), icMat);
mcu.position.set(0, 0.075, 0);
circuitGroup.add(mcu);

// MCU label (thin line marks on top)
const markMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.4 });
const markGeo = new THREE.BoxGeometry(0.8, 0.005, 0.04);
for (let i = 0; i < 4; i++) {
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.position.set(0, 0.13, -0.2 + i * 0.13);
    circuitGroup.add(mark);
}

// MCU Pins
const pinMat = new THREE.MeshStandardMaterial({ color: 0xb0b8c8, metalness: 0.85, roughness: 0.15 });
const pinGeo = new THREE.BoxGeometry(0.035, 0.14, 0.07);
for (let i = 0; i < 8; i++) {
    const offset = -0.525 + i * 0.15;
    [[-0.62, offset, 0], [0.62, offset, 0],
     [offset, -0.62, Math.PI / 2], [offset, 0.62, Math.PI / 2]].forEach(([px, pz, ry]) => {
        const p = new THREE.Mesh(pinGeo, pinMat);
        if (ry) p.rotation.y = ry;
        p.position.set(px, 0.05, pz);
        circuitGroup.add(p);
    });
}

// Header connector
const headerMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22 });
const header    = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 1.5), headerMat);
header.position.set(1.45, 0.1, 0);
circuitGroup.add(header);

const hpinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1, roughness: 0.25 });
for (let i = 0; i < 10; i++) {
    const hp = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32), hpinMat);
    hp.position.set(1.45, 0.16, -0.675 + i * 0.15);
    circuitGroup.add(hp);
}

// Smaller ICs
const smallGeo = new THREE.BoxGeometry(0.42, 0.08, 0.62);
[-0.55, 0.55].forEach(z => {
    const ic = new THREE.Mesh(smallGeo, icMat);
    ic.position.set(-1.22, 0.065, z);
    circuitGroup.add(ic);
});

// Capacitors
const capBodyMat = new THREE.MeshStandardMaterial({ color: 0x001133, roughness: 0.35, metalness: 0.7 });
const capTopMat  = new THREE.MeshStandardMaterial({ color: 0xaabbcc, metalness: 0.9 });
[[-0.5, 0.82], [-0.2, 0.82], [0.82, -0.82]].forEach(([x, z]) => {
    const grp  = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3), capBodyMat);
    body.position.y = 0.15;
    const top  = new THREE.Mesh(new THREE.CylinderGeometry(0.101, 0.101, 0.05), capTopMat);
    top.position.y = 0.28;
    grp.add(body, top);
    grp.position.set(x, 0.025, z);
    circuitGroup.add(grp);
});

// Glowing LED
const ledMat  = new THREE.MeshStandardMaterial({
    color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 2.5
});
const led     = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), ledMat);
led.position.set(0.82, 0.075, 0.82);
circuitGroup.add(led);

// LED light source
const ledPoint = new THREE.PointLight(0x00d4ff, 15, 4);
ledPoint.position.set(0.82, 0.4, 0.82);
circuitGroup.add(ledPoint);

// Traces
const traceMat = new THREE.LineBasicMaterial({ color: 0x0099cc, linewidth: 1 });
const addTrace = (pts) => {
    const geo   = new THREE.BufferGeometry().setFromPoints(
        pts.map(([x, z]) => new THREE.Vector3(x, 0.03, z))
    );
    circuitGroup.add(new THREE.Line(geo, traceMat));
};
addTrace([[-1.2, 0.2], [-0.8, 0.2], [-0.6, 0]]);
addTrace([[-1.2, 0.82], [-1.0, 0.82], [-0.6, 0.4], [-0.6, 0.2]]);
addTrace([[0.6, 0.2], [0.82, 0.4], [1.22, 0.4]]);
addTrace([[0.6, -0.2], [1.0, -0.2], [1.22, -0.4]]);
addTrace([[-0.2, -0.6], [-0.2, -0.82], [-0.82, -0.82]]);
addTrace([[0, -0.6], [0.4, -0.6], [0.6, -0.4]]);

scene.add(circuitGroup);

/* — Background Particles — */
const particleGeo = new THREE.BufferGeometry();
const COUNT       = 1200;
const posArr      = new Float32Array(COUNT * 3);
for (let i = 0; i < COUNT * 3; i++) posArr[i] = (Math.random() - 0.5) * 24;
particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

const particleMesh = new THREE.Points(particleGeo, new THREE.PointsMaterial({
    size: 0.018, color: 0x00aaff, transparent: true, opacity: 0.45,
    blending: THREE.AdditiveBlending, depthWrite: false
}));
scene.add(particleMesh);

/* — Noise & Mouse — */
const noise3D         = createNoise3D();
let   mouseX = 0, mouseY = 0;
let   targetX = 0, targetY = 0;

document.addEventListener('mousemove', e => {
    mouseX = (e.clientX - window.innerWidth  / 2) * 0.001;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
});

/* — Animation State — */
const clock          = new THREE.Clock();
let   cumulativeSpin = 0;
window.sceneState    = { isSpinning: true, isTracesVisible: true, currentLedColorIdx: 0 };

const ledColors = [0x00d4ff, 0xff4466, 0x00ff88, 0xffcc00, 0xaa44ff];

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time  = clock.getElapsedTime();

    // Lerp mouse
    targetX += (mouseX - targetX) * 0.06;
    targetY += (mouseY - targetY) * 0.06;

    if (window.sceneState.isSpinning) cumulativeSpin += delta * 0.4;

    circuitGroup.rotation.y = cumulativeSpin + targetX * 0.6;
    circuitGroup.rotation.x = 0.45 + targetY * 0.5;

    // Pulse LED
    ledMat.emissiveIntensity  = 2 + Math.sin(time * 4) * 0.8;
    ledPoint.intensity        = 12 + Math.sin(time * 4) * 5;

    // Animate cyan accent light
    cyanLight.position.x = Math.sin(time * 0.3) * 6;
    cyanLight.position.y = Math.cos(time * 0.2) * 4 + 3;

    // Particles drift
    particleMesh.rotation.y = -time * 0.04;
    particleMesh.rotation.x =  time * 0.018;

    renderer.render(scene, camera);
}
animate();

/* — Resize — */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/* ═══════════════════════════════════════════════════════════
   HUD CONTROLS
═══════════════════════════════════════════════════════════ */
document.getElementById('btn-spin')?.addEventListener('click', () => {
    window.sceneState.isSpinning = !window.sceneState.isSpinning;
});

document.getElementById('btn-led')?.addEventListener('click', () => {
    window.sceneState.currentLedColorIdx =
        (window.sceneState.currentLedColorIdx + 1) % ledColors.length;
    const c = ledColors[window.sceneState.currentLedColorIdx];
    ledMat.color.setHex(c);
    ledMat.emissive.setHex(c);
    ledPoint.color.setHex(c);
});

document.getElementById('btn-traces')?.addEventListener('click', () => {
    window.sceneState.isTracesVisible = !window.sceneState.isTracesVisible;
    traceMat.visible = window.sceneState.isTracesVisible;
});

/* ═══════════════════════════════════════════════════════════
   GLASS CARD FLASHLIGHT EFFECT
═══════════════════════════════════════════════════════════ */
function attachFlashlight(card) {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
    });
}
document.querySelectorAll('.glass-card').forEach(attachFlashlight);

/* ═══════════════════════════════════════════════════════════
   HAMBURGER MENU
═══════════════════════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

/* ═══════════════════════════════════════════════════════════
   NAV SCROLL — highlight active / shrink on scroll
═══════════════════════════════════════════════════════════ */
const mainNav = document.getElementById('mainNav');
let   lastScroll = 0;

window.addEventListener('scroll', () => {
    const y = window.scrollY;
    mainNav?.classList.toggle('nav--solid', y > 60);
    lastScroll = y;
}, { passive: true });

/* ═══════════════════════════════════════════════════════════
   LANGUAGE TOGGLE (EN → HE → AR → EN)
═══════════════════════════════════════════════════════════ */
const langToggle = document.getElementById('langToggle');
const LANGS      = ['en', 'he', 'ar'];
let   langIdx    = 0;

langToggle?.addEventListener('click', () => {
    langIdx = (langIdx + 1) % LANGS.length;
    const lang = LANGS[langIdx];
    document.body.classList.remove('lang-mode-en', 'lang-mode-he', 'lang-mode-ar', 'rtl-mode');
    document.body.classList.add(`lang-mode-${lang}`);
    if (lang === 'he' || lang === 'ar') document.body.classList.add('rtl-mode');
    // Update html lang attribute for accessibility
    document.documentElement.lang = lang;
});

/* ═══════════════════════════════════════════════════════════
   BACK TO TOP
═══════════════════════════════════════════════════════════ */
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    backToTopBtn?.classList.toggle('visible', window.scrollY > 350);
}, { passive: true });

backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL (IntersectionObserver)
═══════════════════════════════════════════════════════════ */
function initReveal() {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    els.forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   BOOT TERMINAL SEQUENCE
═══════════════════════════════════════════════════════════ */
const BOOT_LINES = [
    { text: '> BIOS v2.4.1 — Technion Hardware Lab', cls: '' },
    { text: '> Initializing memory banks...   [OK]', cls: 't-success' },
    { text: '> Loading firmware image...       [OK]', cls: 't-success' },
    { text: '> Compiling C++ runtime...        [OK]', cls: 't-success' },
    { text: '> Mounting virtual filesystem...  [OK]', cls: 't-success' },
    { text: '> Scanning peripheral bus...      [OK]', cls: 't-success' },
    { text: '> Activating 3D environment...    [OK]', cls: 't-success' },
    { text: '> System ready. Launching UI...', cls: 't-warn' },
];

function runBootSequence() {
    const preloader = document.getElementById('preloader');
    const termText  = document.getElementById('terminal-text');
    if (!termText) { afterBoot(); return; }

    let idx = 0;

    function nextLine() {
        if (idx >= BOOT_LINES.length) {
            setTimeout(afterBoot, 500);
            return;
        }
        const line  = BOOT_LINES[idx++];
        const div   = document.createElement('div');
        div.textContent = line.text;
        if (line.cls) div.classList.add(line.cls);
        termText.appendChild(div);
        setTimeout(nextLine, Math.random() * 280 + 80);
    }
    nextLine();

    function afterBoot() {
        preloader?.classList.add('fade-out');
        document.getElementById('langControlPanel')?.classList.add('visible');
        setTimeout(initHeroTerminal, 350);
        setTimeout(initReveal, 200);
    }
}

/* ═══════════════════════════════════════════════════════════
   HERO TERMINAL WIDGET
   Types out a realistic "firmware_status.sh" readout
═══════════════════════════════════════════════════════════ */
const HERO_TERMINAL_LINES = [
    { text: '#!/bin/bash',                               cls: 't-comment', delay: 0    },
    { text: '# firmware_status.sh — v1.0.3',             cls: 't-comment', delay: 200  },
    { text: '',                                           cls: '',          delay: 300  },
    { text: 'printf "Engineer: Tareq Suliman"',           cls: 't-prompt',  delay: 500  },
    { text: 'Engineer: Tareq Suliman',                    cls: 't-value',   delay: 900  },
    { text: '',                                           cls: '',          delay: 950  },
    { text: 'printf "Focus: Electronics Engineering"',    cls: 't-prompt',  delay: 1100 },
    { text: 'Focus:    Electronics Engineering',          cls: 't-value',   delay: 1500 },
    { text: '',                                           cls: '',          delay: 1550 },
    { text: 'check_year --current',                       cls: 't-prompt',  delay: 1700 },
    { text: 'Year 1 — Technion, Active',                  cls: 't-value',   delay: 2100 },
    { text: '',                                           cls: '',          delay: 2150 },
    { text: 'check_status --availability',                cls: 't-prompt',  delay: 2300 },
    { text: 'Status: Seeking Internship... Done.',        cls: 't-success', delay: 2800 },
    { text: '',                                           cls: '',          delay: 2880 },
    { text: '# Currently learning: C | Electronics',     cls: 't-comment', delay: 3000 },
    { text: '# Foundation: Physics | Math | Circuits',   cls: 't-comment', delay: 3200 },
    { text: '',                                           cls: '',          delay: 3280 },
    { text: 'echo "Ready to learn and grow"',             cls: 't-prompt',  delay: 3400 },
    { text: 'Ready to learn, build, and grow.',           cls: 't-value',   delay: 3800 },
    { text: '▋',                                          cls: 'terminal-cursor', delay: 3900 },
];


function initHeroTerminal() {
    const body = document.getElementById('heroTerminal');
    if (!body) return;

    HERO_TERMINAL_LINES.forEach(({ text, cls, delay }) => {
        setTimeout(() => {
            const line = document.createElement('div');
            line.classList.add('t-line');
            if (cls) line.classList.add(cls);
            line.textContent = text;
            body.appendChild(line);
            // Auto-scroll
            body.scrollTop = body.scrollHeight;
        }, delay);
    });
}

/* ═══════════════════════════════════════════════════════════
   BOOT ON DOM READY
═══════════════════════════════════════════════════════════ */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBootSequence);
} else {
    runBootSequence();
}

/* ═══════════════════════════════════════════════════════════
   ACTIVE NAV LINK ON SCROLL
═══════════════════════════════════════════════════════════ */
function updateActiveNav() {
    const sections = document.querySelectorAll('main section[id]');
    const links    = document.querySelectorAll('.nav-link');

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            links.forEach(link => {
                const match = link.getAttribute('href') === `#${id}`;
                link.style.color  = match ? 'var(--accent)' : '';
                link.style.background = match ? 'var(--accent-dim)' : '';
            });
        });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => io.observe(s));
}

document.addEventListener('DOMContentLoaded', () => {
    updateActiveNav();
    // Re-attach flashlight to any cards rendered after boot
    document.querySelectorAll('.glass-card').forEach(attachFlashlight);
});
