const GRID_SIZE = 10;
const MINE_COUNT = 10;

let grid = [];
let revealed = new Set();
let flagged = new Set();
let gameOver = false;
let firstClick = true;

const boardElement = document.getElementById('minesweeper');
let mineCountElement = document.getElementById('mine-count');
let flagCountElement = document.getElementById('flag-count');
const statusElement = document.getElementById('status');

function createGridData() {
    grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        grid[y] = new Array(GRID_SIZE).fill(0);
    }
}

function placeMines(firstClickX, firstClickY) {
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        const isStartArea = Math.abs(x - firstClickX) <= 1 && Math.abs(y - firstClickY) <= 1;

        if (grid[y][x] !== 'M' && !isStartArea) {
            grid[y][x] = 'M';
            minesPlaced++;
        }
        if (minesPlaced < MINE_COUNT && (GRID_SIZE * GRID_SIZE - minesPlaced) <= 9 && isStartArea) {
            if (grid[y][x] !== 'M') {
                grid[y][x] = 'M';
                minesPlaced++;
            }
        }
    }

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[y][x] === 'M') continue;
            let count = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE && grid[ny][nx] === 'M') {
                        count++;
                    }
                }
            }
            grid[y][x] = count;
        }
    }
}

function revealCell(x, y) {
    if (gameOver || x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    const key = `${x},${y}`;
    if (revealed.has(key) || flagged.has(key)) return;

    if (firstClick) {
        placeMines(x, y);
        firstClick = false;
    }

    const cellElement = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cellElement) return;

    revealed.add(key);
    cellElement.classList.add('revealed');
    cellElement.classList.remove('flagged');
    cellElement.innerHTML = '';

    if (grid[y][x] === 'M') {
        cellElement.classList.add('mine');
        cellElement.innerHTML = '💣';
        endGame(false);
        return;
    }

    if (grid[y][x] > 0) {
        cellElement.textContent = grid[y][x];
        cellElement.classList.add(`c${grid[y][x]}`);
    } else {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                revealCell(x + dx, y + dy);
            }
        }
    }
    checkWin();
}

function flagCell(x, y) {
    if (gameOver || x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    const key = `${x},${y}`;
    if (revealed.has(key)) return;

    const cellElement = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (!cellElement) return;

    if (flagged.has(key)) {
        flagged.delete(key);
        cellElement.classList.remove('flagged');
    } else {
        flagged.add(key);
        cellElement.classList.add('flagged');
        cellElement.textContent = '';
    }
    updateFlagCount();
}

function updateFlagCount() {
    if (flagCountElement) {
        flagCountElement.textContent = flagged.size;
    }
}

function checkWin() {
    const totalCells = GRID_SIZE * GRID_SIZE;
    if (revealed.size === totalCells - MINE_COUNT && !gameOver) {
        endGame(true);
    }
}

function endGame(isWin) {
    if (gameOver) return;
    gameOver = true;
    revealAllMines(isWin);
    statusElement.textContent = isWin ? '🎉 You Win! 🎉' : '💥 Game Over! 💥';
}

function revealAllMines(isWin) {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const key = `${x},${y}`;
            const cellElement = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
            if (!cellElement) continue;

            if (grid[y][x] === 'M') {
                if (!revealed.has(key) && !(isWin && flagged.has(key))) {
                    cellElement.classList.remove('flagged');
                    cellElement.classList.add('revealed', 'mine');
                    cellElement.innerHTML = '💣';
                } else if (isWin && flagged.has(key)) {
                    cellElement.classList.add('c2');
                }
            } else if (!isWin && flagged.has(key)) {
                cellElement.classList.remove('flagged');
                cellElement.classList.add('revealed');
                cellElement.innerHTML = '❌';
            }
        }
    }
}

function createBoardDOM() {
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 30px)`;
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', () => revealCell(x, y));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagCell(x, y);
            });
            boardElement.appendChild(cell);
        }
    }
}

function resetGame() {
    grid = [];
    revealed.clear();
    flagged.clear();
    gameOver = false;
    firstClick = true;
    statusElement.innerHTML = `Mines: <span id="mine-count">${MINE_COUNT}</span> | Flags: <span id="flag-count">0</span>`;
    mineCountElement = document.getElementById('mine-count');
    flagCountElement = document.getElementById('flag-count');
    createGridData();
    createBoardDOM();
    updateFlagCount();
    if (mineCountElement) mineCountElement.textContent = MINE_COUNT;
}

resetGame();
