import { COLS, ROWS } from './constants.js';

export function isValid(x, y) {
    return x >= 0 && x < COLS && y >= 0 && y < ROWS;
}

export function isCollision(x, y, snakeArr) {
    for(let i = 0; i < snakeArr.length - 1; i++) {
        if (x === snakeArr[i].x && y === snakeArr[i].y) return true;
    }
    return false;
}
