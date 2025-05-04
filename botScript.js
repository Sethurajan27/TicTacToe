const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const status = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const undoButton = document.getElementById('undoButton');
const winPopup = document.getElementById('winPopup');
const winnerText = document.getElementById('winnerText');
const closePopup = document.getElementById('closePopup');
const glitterContainer = document.querySelector('.glitter-container');
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const bonkSound = document.getElementById('bonkSound');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

let currentPlayer = 'X'; // Player is always X, Bot is always O
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let moveHistory = [];
let difficulty = 'easy'; // Default difficulty

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Sound functions
function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play().catch(error => console.log("Audio play failed:", error));
}

function playWinSound() {
    winSound.currentTime = 0;
    winSound.play().catch(error => console.log("Audio play failed:", error));
}

function playBonkSound() {
    bonkSound.currentTime = 0;
    bonkSound.play().catch(error => console.log("Audio play failed:", error));
}

// Bot logic
function getBotMove() {
    switch(difficulty) {
        case 'hard':
            return getBestMove();
        case 'medium':
            return Math.random() < 0.7 ? getBestMove() : getRandomMove();
        case 'easy':
        default:
            return Math.random() < 0.3 ? getBestMove() : getRandomMove();
    }
}

function getRandomMove() {
    const emptyCells = gameState.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < 9; i++) {
        if (gameState[i] === '') {
            gameState[i] = 'O';
            let score = minimax(gameState, 0, false);
            gameState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    if (checkWinForMinimax('O')) return 1;
    if (checkWinForMinimax('X')) return -1;
    if (checkDraw()) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinForMinimax(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameState[index] === player;
        });
    });
}

// Game logic
function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (gameState[cellIndex] !== '' || !gameActive || currentPlayer !== 'X') {
        return;
    }

    playClickSound();
    makeMove(cellIndex);

    if (gameActive) {
        currentPlayer = 'O';
        status.textContent = "Bot's Turn (O)";
        
        // Bot's turn with a slight delay
        setTimeout(() => {
            const botMove = getBotMove();
            playClickSound();
            makeMove(botMove);
            if (gameActive) {
                currentPlayer = 'X';
                status.textContent = "Your Turn (X)";
            }
        }, 500);
    }
}

function makeMove(cellIndex) {
    moveHistory.push({
        cellIndex,
        player: currentPlayer,
        gameState: [...gameState]
    });
    
    undoButton.disabled = false;
    
    gameState[cellIndex] = currentPlayer;
    cells[cellIndex].textContent = currentPlayer;
    cells[cellIndex].classList.add(currentPlayer.toLowerCase());

    if (checkWin()) {
        gameActive = false;
        const winner = currentPlayer === 'X' ? 'You' : 'Bot';
        status.textContent = `${winner} Win!`;
        showWinPopup(null, winner);
        return;
    }

    if (checkDraw()) {
        gameActive = false;
        status.textContent = "Game Draw!";
        showWinPopup("It's a Draw! 🤝");
        return;
    }
}

function showWinPopup(message, winner) {
    if (winner) {
        winnerText.textContent = `${winner} Win! 🎉`;
        playWinSound();
    } else {
        winnerText.textContent = message;
        playBonkSound();
    }
    
    winPopup.classList.add('active');
    
    const glitterInterval = setInterval(() => {
        createGlitter();
    }, 50);

    setTimeout(() => {
        clearInterval(glitterInterval);
    }, 2000);
}

function createGlitter() {
    const glitter = document.createElement('div');
    glitter.className = 'glitter';
    
    glitter.style.left = Math.random() * 100 + '%';
    glitter.style.top = Math.random() * 100 + '%';
    
    const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'];
    glitter.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    glitterContainer.appendChild(glitter);
    
    setTimeout(() => {
        glitter.remove();
    }, 1000);
}

function undoMove() {
    if (moveHistory.length < 2 || !gameActive) { // Need to undo both player and bot moves
        return;
    }

    playClickSound();

    // Undo bot's move
    moveHistory.pop();
    // Undo player's move
    const lastMove = moveHistory.pop();
    gameState = [...lastMove.gameState];
    currentPlayer = 'X';
    
    cells.forEach((cell, index) => {
        cell.textContent = gameState[index];
        cell.classList.remove('x', 'o');
        if (gameState[index] === 'X') {
            cell.classList.add('x');
        } else if (gameState[index] === 'O') {
            cell.classList.add('o');
        }
    });

    status.textContent = "Your Turn (X)";
    
    if (moveHistory.length === 0) {
        undoButton.disabled = true;
    }
}

function checkWin() {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameState[index] === currentPlayer;
        });
    });
}

function checkDraw() {
    return gameState.every(cell => cell !== '');
}

function restartGame() {
    playClickSound();
    
    currentPlayer = 'X';
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', ''];
    moveHistory = [];
    status.textContent = "Your Turn (X)";
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    winPopup.classList.remove('active');
    undoButton.disabled = true;
}

// Difficulty selection
difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        playClickSound();
        difficultyButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        difficulty = button.dataset.difficulty;
        restartGame();
    });
});

// Event listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', restartGame);
closePopup.addEventListener('click', () => {
    playClickSound();
    restartGame();
});
undoButton.addEventListener('click', undoMove);

// Initially disable undo button
undoButton.disabled = true; 