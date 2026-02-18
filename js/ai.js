import { isValid, isCollision } from './utils.js';
import { COLS, ROWS } from './constants.js';

function getPathBFS(start, target, currentSnake) {
    let queue = [start];
    let cameFrom = new Map();
    let visited = new Set();
    let startKey = `${start.x},${start.y}`;
    visited.add(startKey);
    cameFrom.set(startKey, null);
    let found = false;

    while (queue.length > 0) {
        let current = queue.shift();
        if (current.x === target.x && current.y === target.y) {
            found = true;
            break;
        }
        const dirs = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}].sort(() => Math.random() - 0.5);
        for (let dir of dirs) {
            let nextX = current.x + dir.x;
            let nextY = current.y + dir.y;
            let nextKey = `${nextX},${nextY}`;
            if (isValid(nextX, nextY) && !visited.has(nextKey)) {
                if (!isCollision(nextX, nextY, currentSnake)) {
                    visited.add(nextKey);
                    cameFrom.set(nextKey, current);
                    queue.push({x: nextX, y: nextY});
                }
            }
        }
    }
    if (!found) return null;
    let path = [];
    let curr = target;
    while (curr) {
        path.push(curr);
        curr = cameFrom.get(`${curr.x},${curr.y}`);
    }
    path.reverse(); 
    path.shift(); 
    return path;
}

function simulateMove(currentSnake, pathSteps) {
    let newSnake = JSON.parse(JSON.stringify(currentSnake));
    for (let step of pathSteps) {
        newSnake.unshift(step);
    }
    while(newSnake.length > currentSnake.length + 1) {
        newSnake.pop();
    }
    return newSnake;
}

function getPathLengthToTail(start, target, currentSnake) {
    let queue = [{pos: start, dist: 0}];
    let visited = new Set();
    visited.add(`${start.x},${start.y}`);
    
    while(queue.length > 0) {
        let {pos, dist} = queue.shift();
        if (pos.x === target.x && pos.y === target.y) return dist;
        const dirs = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
        for (let dir of dirs) {
            let nx = pos.x + dir.x;
            let ny = pos.y + dir.y;
            let key = `${nx},${ny}`;
            if (isValid(nx, ny) && !visited.has(key)) {
                if (!isCollision(nx, ny, currentSnake) || (nx === target.x && ny === target.y)) {
                    visited.add(key);
                    queue.push({pos: {x:nx, y:ny}, dist: dist + 1});
                }
            }
        }
    }
    return -1;
}

export function decideNextMove(snake, foods) {
    const head = snake[0];
    const tail = snake[snake.length - 1];
    
    if (foods.length === 0) return null;

    let targetFood = foods[0];
    let minDisk = 9999;
    for (let f of foods) {
        let d = Math.abs(head.x - f.x) + Math.abs(head.y - f.y);
        if (d < minDisk) {
            minDisk = d;
            targetFood = f;
        }
    }

    let pathToFood = getPathBFS(head, targetFood, snake);
    if (pathToFood && pathToFood.length > 0) {
        let virtualSnake = simulateMove(snake, pathToFood);
        let vHead = virtualSnake[0];
        let vTail = virtualSnake[virtualSnake.length - 1]; 
        let escapePath = getPathBFS(vHead, vTail, virtualSnake);
        if (escapePath) return pathToFood[0]; 
    }

    let bestStallMove = null;
    let maxDistanceToTail = -1;
    const dirs = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}].sort(() => Math.random() - 0.5);
    
    for (let dir of dirs) {
        let nx = head.x + dir.x;
        let ny = head.y + dir.y;
        if (isValid(nx, ny) && !isCollision(nx, ny, snake)) {
            let pathLen = getPathLengthToTail({x:nx, y:ny}, tail, snake);
            if (pathLen !== -1 && pathLen > maxDistanceToTail) {
                maxDistanceToTail = pathLen;
                bestStallMove = {x: nx, y: ny};
            }
        }
    }
    let fallbackMove = null;
    const safeDir = dirs.find(d => isValid(head.x+d.x, head.y+d.y) && !isCollision(head.x+d.x, head.y+d.y, snake));
    if (safeDir) {
        fallbackMove = {x: head.x + safeDir.x, y: head.y + safeDir.y};
    }
    
    return bestStallMove || fallbackMove;
}
