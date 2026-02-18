import { GameConfig, COLS, ROWS, COLORS, MAX_MOVES_WITHOUT_EAT } from './constants.js';
import { createExplosion, createFloatingText } from './particles.js';
import { decideNextMove } from './ai.js';
import { render } from './renderer.js';
import { isCollision } from './utils.js';

/**
 * CONFIGURATION
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiOverlay = document.getElementById('ui-overlay');
const startBtn = document.getElementById('start-btn');
const scoreVal = document.getElementById('score-val');
const lengthVal = document.getElementById('length-val');
const hungerFill = document.getElementById('hunger-fill');
const overlayTitle = document.getElementById('overlay-title');
const overlaySub = document.getElementById('overlay-sub');

// Stats Elements
const topScoreEl = document.getElementById('top-score-val');
const totalGamesEl = document.getElementById('total-games-val');
const comboGroup = document.getElementById('combo-group');
const comboValEl = document.getElementById('combo-val');
const comboBarFill = document.getElementById('combo-bar-fill');

// Game State
let snake = [];
let foods = []; 
let particles = []; 
let score = 0;
let gameTimeout = null;
let isRunning = false;
let frameCount = 0; 
let movesSinceEat = 0;
let currentSpeed = 100;

// Stats State
let topScore = 0;
let totalGames = 0;

// Combo State
let comboCount = 0;
let comboTimer = 0;
const COMBO_DURATION = 80;

// --- RESPONSIVE LOGIC ---
function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth - 40, 500);
    GameConfig.BLOCK_SIZE = Math.floor(maxWidth / COLS);
    canvas.width = GameConfig.BLOCK_SIZE * COLS;
    canvas.height = GameConfig.BLOCK_SIZE * ROWS;
    if (!isRunning) drawFrame();
}
window.addEventListener('resize', resizeCanvas);


// --- GAME ENGINE ---
function initGame() {
    if (gameTimeout) clearTimeout(gameTimeout);
    snake = [{x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}, {x: 2, y: 10}];
    foods = [];
    particles = [];
    score = 0;
    movesSinceEat = 0;
    frameCount = 0;
    currentSpeed = 100; // Reset Speed
    
    // Reset Combo
    comboCount = 0;
    comboTimer = 0;

    totalGames++;
    updateStatsUI();

    updateUI();
    uiOverlay.classList.add('hidden');
    addFood('NORMAL');
    
    resizeCanvas(); 

    isRunning = true;
    gameLoop();
}

function spawnFoodLogic() {
    const isJackpot = Math.random() < 0.20;
    addFood('NORMAL');
    if (isJackpot) {
        // Random bonus count between 5 and 30
        const bonusCount = Math.floor(Math.random() * 26) + 5; 
        for(let i=0; i<bonusCount; i++) addFood('BONUS');
    }
}

function addFood(type) {
    let valid = false;
    let rx, ry, attempts = 0;
    while(!valid && attempts < 100) {
        rx = Math.floor(Math.random() * COLS);
        ry = Math.floor(Math.random() * ROWS);
        let hitSnake = snake.some(p => p.x === rx && p.y === ry);
        let hitFood = foods.some(f => f.x === rx && f.y === ry);
        if (!hitSnake && !hitFood) valid = true;
        attempts++;
    }
    if(valid) foods.push({x: rx, y: ry, type: type});
}

function updateUI() {
    scoreVal.innerText = "SCORE: " + score;
    lengthVal.innerText = "LENGTH: " + snake.length;
    
    const percent = Math.max(0, 100 - ((movesSinceEat / MAX_MOVES_WITHOUT_EAT) * 100));
    hungerFill.style.width = percent + "%";
    
    // Critical Mode logic
    if (percent < 25) {
        hungerFill.style.background = "#ff0055";
        hungerFill.style.boxShadow = "0 0 15px #ff0055";
        document.body.classList.add('critical');
    } else {
        document.body.classList.remove('critical');
        if (percent < 50) {
            hungerFill.style.background = "#ffd700";
            hungerFill.style.boxShadow = "0 0 10px #ffd700";
        } else {
            hungerFill.style.background = "#00f3ff";
            hungerFill.style.boxShadow = "0 0 10px #00f3ff";
        }
    }

    // Update Combo UI
    if (comboCount > 0) {
        comboGroup.style.opacity = "1";
        comboValEl.innerText = "x" + (1 + comboCount * 0.1).toFixed(1);
        const comboPercent = (comboTimer / COMBO_DURATION) * 100;
        comboBarFill.style.width = comboPercent + "%";
    } else {
        comboGroup.style.opacity = "0.3";
        comboValEl.innerText = "x1.0";
        comboBarFill.style.width = "0%";
    }
}

function gameLoop() {
    if (!isRunning) return;
    
    frameCount++;
    movesSinceEat++;
    if (movesSinceEat >= MAX_MOVES_WITHOUT_EAT) {
        gameOver("ENERGY DEPLETED"); 
        return;
    }
    
    // Combo Decay
    if (comboCount > 0) {
        comboTimer--;
        if (comboTimer <= 0) {
            comboCount = 0;
        }
    }

    updateUI();

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }

    let nextMove = decideNextMove(snake, foods);

    if (nextMove) {
        const dx = nextMove.x - snake[0].x;
        const dy = nextMove.y - snake[0].y;
        updateKeyVisuals(dx, dy);

        let ateIndex = foods.findIndex(f => f.x === nextMove.x && f.y === nextMove.y);
        snake.unshift(nextMove);
        
        if (ateIndex !== -1) {
            let eatenFoodType = foods[ateIndex].type;
            
            comboCount++;
            comboTimer = COMBO_DURATION;

            // Trigger Pop Animation
            comboValEl.classList.remove('pop');
            void comboValEl.offsetWidth; // Trigger reflow
            comboValEl.classList.add('pop');

            const multiplier = 1 + (comboCount * 0.1); 
            const basePoints = (eatenFoodType === 'BONUS' ? 25 : 10);
            score += Math.floor(basePoints * multiplier);
            
            const newParticles = createExplosion(nextMove.x, nextMove.y, eatenFoodType === 'NORMAL' ? COLORS.FOOD_NORMAL : COLORS.FOOD_BONUS, GameConfig.BLOCK_SIZE);
            particles.push(...newParticles);

            if (comboCount > 0) {
                const comboText = createFloatingText(nextMove.x, nextMove.y, `x${multiplier.toFixed(1)}`, '#ff00ea', GameConfig.BLOCK_SIZE);
                particles.push(comboText);
            }
            
            // SPEED RAMP: Increase speed
            // Min speeed 30ms
            currentSpeed = Math.max(30, 100 - (snake.length * 0.5));

            foods.splice(ateIndex, 1);
            movesSinceEat = 0;
            if (eatenFoodType === 'NORMAL') spawnFoodLogic();
        } else {
            snake.pop();
        }
    } else {
        gameOver("COLLISION DETECTED");
        return; 
    }
    drawFrame();
    
    // Schedule next frame
    gameTimeout = setTimeout(gameLoop, currentSpeed);
}

// --- KEY VISUALIZER ---
const keys = {
    w: document.getElementById('key-w'),
    a: document.getElementById('key-a'),
    s: document.getElementById('key-s'),
    d: document.getElementById('key-d')
};

function updateKeyVisuals(dx, dy) {
    Object.values(keys).forEach(k => k.classList.remove('active'));

    if (dy === -1) keys.w.classList.add('active'); // Up
    if (dy === 1)  keys.s.classList.add('active'); // Down
    if (dx === -1) keys.a.classList.add('active'); // Left
    if (dx === 1)  keys.d.classList.add('active'); // Right
}

function gameOver(reason) {
    if (score > topScore) {
        topScore = score;
        updateStatsUI();
    }
    
    // Screen Shake
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);

    isRunning = false;
    clearTimeout(gameTimeout);
    uiOverlay.classList.remove('hidden');
    overlayTitle.innerText = "GAME OVER";
    overlaySub.innerHTML = `Reason: ${reason}<br>Playing again...`;
    startBtn.style.display = 'none'; 
    setTimeout(() => {
        startBtn.style.display = 'block';
        initGame();
    }, 2500);
}

function updateStatsUI() {
    topScoreEl.innerText = topScore;
    totalGamesEl.innerText = totalGames;
}

function drawFrame() {
    const state = {
        snake,
        foods,
        particles,
        frameCount,
        blockSize: GameConfig.BLOCK_SIZE
    };
    render(ctx, canvas, state);
}

startBtn.addEventListener('click', initGame);
resizeCanvas(); 
