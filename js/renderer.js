import { COLS, ROWS, COLORS } from './constants.js';

export function render(ctx, canvas, state) {
    const { snake, foods, particles, frameCount, blockSize } = state;

    // 1. Background
    let gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, blockSize*2, canvas.width/2, canvas.height/2, canvas.width);
    gradient.addColorStop(0, COLORS.BG_LIGHT);
    gradient.addColorStop(1, COLORS.BG_DARK);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2. Grid
    ctx.strokeStyle = COLORS.GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<=COLS; i++) {
        ctx.moveTo(i*blockSize, 0);
        ctx.lineTo(i*blockSize, canvas.height);
    }
    for(let i=0; i<=ROWS; i++) {
        ctx.moveTo(0, i*blockSize);
        ctx.lineTo(canvas.width, i*blockSize);
    }
    ctx.stroke();

    // 3. Particles
    particles.forEach(p => p.draw(ctx));

    // 4. Food
    const pulse = Math.sin(frameCount * 0.2) * 2; 
    for (let f of foods) {
        ctx.fillStyle = f.type === 'NORMAL' ? COLORS.FOOD_NORMAL : COLORS.FOOD_BONUS;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;
        
        ctx.beginPath();
        let size = (blockSize/3) + pulse/2;
        ctx.arc(f.x*blockSize+blockSize/2, f.y*blockSize+blockSize/2, size, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(f.x*blockSize+blockSize/2, f.y*blockSize+blockSize/2, size/2, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;

    // 5. SNAKE RENDER LOGIC
    ctx.lineWidth = blockSize * 0.3; // Skinny spine
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = COLORS.BODY;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.BODY;

    ctx.beginPath();
    if (snake.length > 0) {
        const headX = snake[0].x * blockSize + blockSize/2;
        const headY = snake[0].y * blockSize + blockSize/2;
        ctx.moveTo(headX, headY);

        for (let i = 1; i < snake.length; i++) {
            const px = snake[i].x * blockSize + blockSize/2;
            const py = snake[i].y * blockSize + blockSize/2;
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Nodes/Joints & Head/Tail
    snake.forEach((part, i) => {
        const cx = part.x * blockSize + blockSize/2;
        const cy = part.y * blockSize + blockSize/2;

        if (i === 0) {
            // HEAD (Arrow/Triangle Shape)
            ctx.save();
            ctx.translate(cx, cy);
            
            // Calculate angle based on next part
            let angle = 0;
            if (snake.length > 1) {
                const dx = snake[0].x - snake[1].x;
                const dy = snake[0].y - snake[1].y;
                if (dx === 1) angle = 0;
                else if (dx === -1) angle = Math.PI;
                else if (dy === 1) angle = Math.PI/2;
                else if (dy === -1) angle = -Math.PI/2;
            }
            ctx.rotate(angle);

            // Draw Triangle Head
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(blockSize/2, 0); // Tip
            ctx.lineTo(-blockSize/3, -blockSize/3);
            ctx.lineTo(-blockSize/3, blockSize/3);
            ctx.closePath();
            ctx.fill();

            // Glowing Eye/Core
            ctx.fillStyle = COLORS.FOOD_NORMAL; // Cyan eye
            ctx.beginPath();
            ctx.arc(-blockSize/6, 0, 3, 0, Math.PI*2);
            ctx.fill();
            
            ctx.restore();

        } else if (i === snake.length - 1) {
            // TAIL (Small tapering dot)
            ctx.fillStyle = COLORS.BODY;
            ctx.beginPath();
            ctx.arc(cx, cy, blockSize * 0.15, 0, Math.PI*2);
            ctx.fill();
        } else {
            // BODY NODES (Joints)
            ctx.fillStyle = '#000'; // Black core for tech look
            ctx.strokeStyle = COLORS.BODY;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(cx, cy, blockSize * 0.15, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        }
    });
}
