const grid = document.querySelector('.grid');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalButton = document.getElementById('modal-button');
const keypadMap = new Map([[8,-30],[9,-18],[6,3],[3,22],[2,30],[1,18],[4,-3],[7,-22]]);
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

function registerMove(index) {
    let moveSquare = grid.children[index];

    if (!gameOver && moveSquare.classList.contains('highlight')) {
        // Set attributes for new clicked square
        moveSquare.textContent = currentNumber;
        moveSquare.classList.add('filled', 'current', 'animate');
        moveSquare.classList.remove('highlight');
        document.querySelectorAll('.highlight').forEach(square => square.classList.remove('highlight'));

        // Change previously clicked square, reset variables for new square
        currentSquare.classList.remove('current');
        currentSquare = moveSquare;
        currentNumber++;

        if (currentNumber > 100) {
            const winningSound = new Audio("resources/crowdcheer.ogg");
            winningSound.play();
            modalMessage.innerHTML = "<b>Congratulations! You filled the grid!</b>";
            modal.style.display = 'block';
            gameOver = true;
        } 
        else {
            highlightValidMoves(moveSquare.dataset.index);
            if (document.querySelectorAll('.highlight').length === 0) {
                const gameOverSound = new Audio("resources/EMEXTR4.wav");
                gameOverSound.play();
                let scoreStr = (currentNumber - 1).toString();
                modalMessage.innerHTML = "Game Over! Your score: " + "<b>" + scoreStr + "</b>";
                modal.style.display = 'block';
                gameOver = true;
            }
            else {
                const clickSound = new Audio("resources/EMCLK13.wav");
                clickSound.play();
            }
        }
    }
}

function handleClick(e) {
    registerMove(e.target.dataset.index);
}

function handleKeyPress(e) {
    let numPressed = e.keyCode - 48;
    if (keypadMap.has(numPressed)) {
        let moveIndex = parseInt(currentSquare.dataset.index) + keypadMap.get(numPressed);
        if (moveIndex > -1 && moveIndex < 100) registerMove(moveIndex);
    }
}

function handleModalButtonClick(e) {
    location.reload();
}

createGrid();
placeNumber1();
highlightValidMoves(document.querySelector('.filled').dataset.index);
grid.addEventListener('click', handleClick);
this.addEventListener('keypress', handleKeyPress);
modalButton.addEventListener('click', handleModalButtonClick);