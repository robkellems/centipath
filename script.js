const grid = document.querySelector('.grid');
const message = document.querySelector('.message');
let currentNumber = 2;
let currentSquare;
let gameOver = false;

function createGrid() {
    for (let i = 0; i < 100; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.dataset.index = i;
        grid.appendChild(square);
    }
}

function placeNumber1() {
    const randomIndex = Math.floor(Math.random() * 100);
    const square = grid.children[randomIndex];
    square.textContent = '1';
    square.classList.add('filled', 'current');
    currentSquare = square;
}

function highlightValidMoves(index) {
    const moveIndices = [-30, -18, 3, 22, 30, 18, -3, -22];
    const column = index % 10;
    // Current index is too far left to include some moves
    if (column <= 2) {
        moveIndices.splice(moveIndices.indexOf(-3), 1);
        if (column < 2) {
            moveIndices.splice(moveIndices.indexOf(-22), 1);
            moveIndices.splice(moveIndices.indexOf(18), 1);
        }
    }
    // Current index is too far right to include some moves
    if (column >= 7) {
        moveIndices.splice(moveIndices.indexOf(3), 1);
        if (column > 7) {
            moveIndices.splice(moveIndices.indexOf(22), 1);
            moveIndices.splice(moveIndices.indexOf(-18), 1);
        }
    }

    moveIndices.forEach(moveIndex => {
        const newIndex = parseInt(index) + moveIndex;
        if (newIndex >= 0 && newIndex < 100 && !grid.children[newIndex].classList.contains('filled')) {
            grid.children[newIndex].classList.add('highlight');
        }
    });
}

function handleClick(e) {
    if (!gameOver && e.target.classList.contains('highlight')) {
        // Set parameters for new clicked square
        e.target.textContent = currentNumber;
        e.target.classList.add('filled', 'current', 'animate');
        e.target.classList.remove('highlight');
        document.querySelectorAll('.highlight').forEach(square => square.classList.remove('highlight'));
        
        // Change previously clicked square, reset variables for new square
        currentSquare.classList.remove('current');
        currentSquare = e.target;
        currentNumber++;

        if (currentNumber > 100) {
            const winningSound = new Audio("resources/crowdcheer.ogg");
            winningSound.play();
            message.textContent = 'Congratulations! You won!';
            gameOver = true;
        } else {
            highlightValidMoves(e.target.dataset.index);
            if (document.querySelectorAll('.highlight').length === 0) {
                const gameOverSound = new Audio("resources/EMEXTR4.wav");
                gameOverSound.play();
                message.textContent = 'Game Over! Your score: ' + (currentNumber -1);
                gameOver = true;
            }
            else {
                const clickSound = new Audio("resources/EMCLK13.wav");
                clickSound.play();
            }
        }
    }
}

createGrid();
placeNumber1();
highlightValidMoves(document.querySelector('.filled').dataset.index);
grid.addEventListener('click', handleClick);