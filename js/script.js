// js/script.js
// Matrix-style background effect
function initMatrixEffect() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.querySelector('.code-bg').appendChild(canvas);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const drops = Array(Math.floor(canvas.width / 10)).fill(0);

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 18, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = var(--primary);
        ctx.font = '15px monospace';

        drops.forEach((drop, i) => {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * 10, drop * 10);
            
            if(drop * 10 > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }

    setInterval(draw, 50);
}

// Initialize effects
document.addEventListener('DOMContentLoaded', () => {
    initMatrixEffect();
    
    // Add scroll animations
    gsap.from(".project-card", {
        scrollTrigger: {
            trigger: ".projects",
            start: "top center"
        },
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2
    });
});

document.addEventListener("DOMContentLoaded", function () {
    let textElement = document.querySelector(".typewriter");
    let text = textElement.textContent;
    textElement.textContent = ""; // Clear text

    let i = 0;
    function type() {
        if (i < text.length) {
            textElement.textContent += text.charAt(i);
            i++;
            setTimeout(type, 100); // Adjust speed
        }
    }
    type();
});
