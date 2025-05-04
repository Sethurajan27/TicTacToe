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

let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let moveHistory = [];

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Function to play click sound
function playClickSound() {
    clickSound.currentTime = 0; // Reset sound to start
    clickSound.play().catch(error => console.log("Audio play failed:", error));
}

// Function to play win sound
function playWinSound() {
    winSound.currentTime = 0; // Reset sound to start
    winSound.play().catch(error => console.log("Audio play failed:", error));
}

function playBonkSound() {
    bonkSound.currentTime = 0;
    bonkSound.play().catch(error => console.log("Audio play failed:", error));
}

function createGlitter() {
    const glitter = document.createElement('div');
    glitter.className = 'glitter';
    
    // Random position
    glitter.style.left = Math.random() * 100 + '%';
    glitter.style.top = Math.random() * 100 + '%';
    
    // Random color
    const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'];
    glitter.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    glitterContainer.appendChild(glitter);
    
    // Remove glitter after animation
    setTimeout(() => {
        glitter.remove();
    }, 1000);
}

function showWinPopup(message, winner) {
    if (winner) {
        const playerClass = winner === 'X' ? 'player-x' : 'player-o';
        winnerText.innerHTML = `Player <span class="${playerClass}">${winner}</span> Wins! 🎉`;
        playWinSound();
    } else {
        winnerText.textContent = message;
        playBonkSound();
    }
    
    winPopup.classList.add('active');
    
    // Create multiple glitter particles
    const glitterInterval = setInterval(() => {
        createGlitter();
    }, 50);

    // Stop creating glitter after 2 seconds
    setTimeout(() => {
        clearInterval(glitterInterval);
    }, 2000);
}

function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (gameState[cellIndex] !== '' || !gameActive) {
        return;
    }

    playClickSound();

    // Save move to history
    moveHistory.push({
        cellIndex,
        player: currentPlayer,
        gameState: [...gameState]
    });
    
    // Enable undo button
    undoButton.disabled = false;

    gameState[cellIndex] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    if (checkWin()) {
        gameActive = false;
        status.textContent = `Player ${currentPlayer} Wins!`;
        showWinPopup(null, currentPlayer);
        return;
    }

    if (checkDraw()) {
        gameActive = false;
        status.textContent = "Game Draw!";
        showWinPopup("It's a Draw! 🤝");
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer}'s Turn`;
}

function undoMove() {
    if (moveHistory.length === 0 || !gameActive) {
        return;
    }

    playClickSound();

    const lastMove = moveHistory.pop();
    gameState = [...lastMove.gameState];
    currentPlayer = lastMove.player;
    
    // Update the board visually
    cells.forEach((cell, index) => {
        cell.textContent = gameState[index];
        cell.classList.remove('x', 'o');
        if (gameState[index] === 'X') {
            cell.classList.add('x');
        } else if (gameState[index] === 'O') {
            cell.classList.add('o');
        }
    });

    // Update status
    status.textContent = `Player ${currentPlayer}'s Turn`;
    
    // Disable undo button if no more moves in history
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
    status.textContent = `Player ${currentPlayer}'s Turn`;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    winPopup.classList.remove('active');
    undoButton.disabled = true;
}

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