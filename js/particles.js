export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0; 
        this.decay = Math.random() * 0.05 + 0.02;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.vy = -1; // Float up
        this.life = 1.0;
        this.decay = 0.02;
    }
    update() {
        this.y += this.vy;
        this.life -= this.decay;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = "bold 20px Consolas";
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

export function createExplosion(x, y, color, blockSize) {
    const particles = [];
    const px = x * blockSize + blockSize / 2;
    const py = y * blockSize + blockSize / 2;
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(px, py, color));
    }
    return particles;
}

export function createFloatingText(x, y, text, color, blockSize) {
    const px = x * blockSize;
    const py = y * blockSize;
    return new FloatingText(px, py, text, color);
}
