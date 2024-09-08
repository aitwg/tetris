const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const startButton = document.getElementById('startButton');

const grid = 20;
const tetrominoSequence = [];

// 遊戲區域
const playfield = [];

// 初始化遊戲區域
for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}

// 方塊形狀
const tetrominos = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],
    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],
    'O': [
        [1,1],
        [1,1],
    ],
    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],
    'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ]
};

// 方塊顏色
const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};

// 初始化遊戲區域
for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}

// 方塊形狀和顏色（保持不變）

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;  // 保存requestAnimationFrame的引用
let gameOver = false;
let score = 0;

// 遊戲主循環
function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);

    // 繪製遊戲區域
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                context.fillStyle = colors[name];
                context.fillRect(col * grid, row * grid, grid-1, grid-1);
            }
        }
    }

    // 繪製當前方塊
    if (tetromino) {
        if (++count > 35) {
            tetromino.row++;
            count = 0;

            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }

        context.fillStyle = colors[tetromino.name];

        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {
                    context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
                }
            }
        }
    }

    // 更新分數
    scoreElement.textContent = score;
}

// 生成下一個方塊
function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
        tetrominoSequence.push(...['I', 'J', 'L', 'O', 'S', 'T', 'Z']);
    }

    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];

    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
    const row = name === 'I' ? -1 : -2;

    return {
        name: name,
        matrix: matrix,
        row: row,
        col: col
    };
}

// 檢查移動是否有效
function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                playfield[cellRow + row][cellCol + col])
                ) {
                return false;
            }
        }
    }

    return true;
}

// 放置方塊
function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {
                if (tetromino.row + row < 0) {
                    return showGameOver();
                }

                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }
        }
    }

    // 檢查是否有完整的行
    let clearedLines = 0;
    for (let row = playfield.length - 1; row >= 0; ) {
        if (playfield[row].every(cell => !!cell)) {
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r-1][c];
                }
            }
            clearedLines++;
        }
        else {
            row--;
        }
    }

    // 更新分數
    if (clearedLines > 0) {
        score += clearedLines * 100;
        scoreElement.textContent = score;
    }

    tetromino = getNextTetromino();
}

// 顯示遊戲結束
function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;

    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
}

// 開始遊戲
function startGame() {
    if (rAF) {
        cancelAnimationFrame(rAF);
    }
    gameOver = false;
    score = 0;
    scoreElement.textContent = score;
    playfield.forEach(row => row.fill(0));
    tetromino = getNextTetromino();
    rAF = requestAnimationFrame(loop);
}

// 按鈕控制
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('leftButton').addEventListener('click', () => move(-1));
document.getElementById('rightButton').addEventListener('click', () => move(1));
document.getElementById('upButton').addEventListener('click', rotate);
document.getElementById('downButton').addEventListener('click', moveDown);

// 移動方塊
function move(dir) {
    if (gameOver) return;
    const col = tetromino.col + dir;
    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
    }
}

// 旋轉方塊
function rotate() {
    if (gameOver) return;
    const matrix = rotateMatrix(tetromino.matrix);
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
    }
}

// 向下移動方塊
function moveDown() {
    if (gameOver) return;
    const row = tetromino.row + 1;
    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row - 1;
        placeTetromino();
        return;
    }
    tetromino.row = row;
}

// 旋轉矩陣
function rotateMatrix(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );
    return result;
}

// 鍵盤控制（保持不變，但可以移除，因為我們現在有按鈕控制）

// 初始化遊戲
context.fillStyle = 'black';
context.fillRect(0, 0, canvas.width, canvas.height);
context.fillStyle = 'white';
context.font = '18px Arial';
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText('點擊開始遊戲按鈕', canvas.width / 2, canvas.height / 2);
