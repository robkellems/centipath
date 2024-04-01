const grid = document.querySelector('.grid');
const timer = document.getElementById('timer');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const leaderboard = document.getElementById('leaderboard');
const modalButton = document.getElementById('modal-button');
const keypadMap = new Map([[8,-30],[9,-18],[6,3],[3,22],[2,30],[1,18],[4,-3],[7,-22]]);
let currentNumber = 2;
let currentSquare;
let startTime;
let timerInterval;
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

function formatTime(time) {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds + "." + (milliseconds < 10 ? '0' : '') + milliseconds;
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        timer.textContent = 'Time: ' + formatTime(elapsedTime);
    }, 10);
}

function stopTimer() {
    clearInterval(timerInterval);
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

function storeScore(score, time) {
    let scores = localStorage.getItem('gameScores');
    let times = localStorage.getItem('gameTimes');

    if (scores && times) {
        scores = JSON.parse(scores);
        times = JSON.parse(times);
    }
    else {
        scores = [];
        times = [];
    }

    scores.push(score);
    times.push(time);
    const sortedIndices = scores.map((score, index) => index)
                          .sort((a, b) => scores[b] - scores[a]);
    const topScores = sortedIndices.slice(0, 5).map(index => scores[index]);
    const topTimes = sortedIndices.slice(0, 5).map(index => times[index]);

    localStorage.setItem('gameScores', JSON.stringify(topScores));
    localStorage.setItem('gameTimes', JSON.stringify(topTimes));
}

function updateLeaderboard() {
    const scores = localStorage.getItem('gameScores');
    const times = localStorage.getItem('gameTimes');

    leaderboard.innerHTML = '';

    const headerRow = document.createElement('tr');
    const indexHeader = document.createElement('th');
    indexHeader.textContent = '';
    const scoreHeader = document.createElement('th');
    scoreHeader.textContent = 'Score';
    const timeHeader = document.createElement('th');
    timeHeader.textContent = 'Time';
    headerRow.appendChild(indexHeader);
    headerRow.appendChild(scoreHeader);
    headerRow.appendChild(timeHeader);
    leaderboard.appendChild(headerRow);

    // Create table rows for each stored score and time
    const scoreArray = scores ? JSON.parse(scores) : [];
    const timeArray = times ? JSON.parse(times) : [];
    for (let i = 0; i < scoreArray.length; i++) {
        const row = document.createElement('tr');
        const indexCell = document.createElement('td');
        indexCell.textContent = (i + 1).toString();
        const scoreCell = document.createElement('td');
        scoreCell.textContent = scoreArray[i];
        const timeCell = document.createElement('td');
        timeCell.textContent = timeArray[i];
        row.appendChild(indexCell);
        row.appendChild(scoreCell);
        row.appendChild(timeCell);
        leaderboard.appendChild(row);
    }
}

function endGame(winOrLose) {
    stopTimer();
    let scoreStr = (currentNumber - 1).toString();
    let timeStr = timer.textContent.substring(6); // remove "Time: " from the string
    if (winOrLose === 1) {
        const winningSound = new Audio("resources/crowdcheer.ogg");
        winningSound.play();
        modalMessage.innerHTML = "<b>Congratulations! You filled the grid!</b><br>Score: <b>" + scoreStr + "</b><br>Time: <b>" + timeStr + "</b>";
    }
    else {
        const gameOverSound = new Audio("resources/EMEXTR4.wav");
        gameOverSound.play();
        modalMessage.innerHTML = "Game Over!<br>Score: <b>" + scoreStr + "</b><br>Time: <b>" + timeStr + "</b>";
    }

    storeScore(scoreStr, timeStr);
    updateLeaderboard();

    modal.style.display = 'block';
    gameOver = true;
}

function registerMove(index) {
    let moveSquare = grid.children[index];

    if (!gameOver && moveSquare.classList.contains('highlight')) {
        // Set attributes for new clicked square
        moveSquare.textContent = currentNumber;
        moveSquare.classList.add('filled', 'current', 'animate');
        moveSquare.classList.remove('highlight');
        document.querySelectorAll('.highlight').forEach(square => square.classList.remove('highlight'));

        // Start timer if first move
        if (currentNumber === 2) startTimer();

        // Change previously clicked square, reset variables for new square
        currentSquare.classList.remove('current');
        currentSquare = moveSquare;
        currentNumber++;

        if (currentNumber > 100) endGame(1);
        else {
            highlightValidMoves(moveSquare.dataset.index);
            if (document.querySelectorAll('.highlight').length === 0) endGame(0);
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