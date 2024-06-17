import { getLoggedIn } from "./authentication.js";
import { navigateTo } from "./index.js";
import { getDefaultHeader, toastErrorMessage } from "./shared.js";

const FPS = 60;
const INTERVAL = 1000 / FPS;
const AI_INTERVAL = 1000;
const INITIAL_PADDLE_SPEED = 12;
const MAX_SCORE = 5;
const BALL_BOUNCE_DEPTH = 5;

const POST_GAME_ID = 'https://transcendence.myprojekt.tech/api-game/game'
const POST_SCORE_API = 'https://transcendence.myprojekt.tech/api-game/score'

class PongGame {
    constructor(options) {

        /* Declare the Board class */
        this.Board = class Board {
            constructor(object) {
                this.object = object;
                let bounds = object.getBoundingClientRect();
                this.width = bounds.width;
                this.height = bounds.height;
                this.top = bounds.top;
                this.left = bounds.left;
                this.bottom = bounds.bottom;
                this.right = bounds.right;
            }
            update() {
                let bounds = this.object.getBoundingClientRect();
                this.width = bounds.width;
                this.height = bounds.height;
                this.top = bounds.top;
                this.left = bounds.left;
                this.bottom = bounds.bottom;
                this.right = bounds.right;
            }
        }
        this.board = new this.Board(document.getElementById('board'));

        /* Declare an IIFE class for the Ball to be able to pass the board element */
        this.Ball = (function (board) {
            return class Ball {
                constructor(object) {
                    this.object = object;
                    let bounds = object.getBoundingClientRect();
                    this.width = bounds.width;
                    this.height = bounds.height;
                    this.x = board.left + (board.width - bounds.width) / 2;
                    this.y = board.top + (board.height - bounds.height) / 2;
                    this.dx = 0;
                    this.dy = 0;
                }
            }
        })(this.board);
        this.ball = new this.Ball(document.getElementById('ball'));

        /* Declare the Paddle class */
        this.Paddle = class Paddle {
            constructor(object) {
                this.object = object;
                let bounds = object.getBoundingClientRect();
                this.width = bounds.width;
                this.height = bounds.height;
                this.y = bounds.y;
                this.dy = 0;
            }
        }
        this.paddleLeft = new this.Paddle(document.getElementById('paddle_l'));
        this.paddleRight = new this.Paddle(document.getElementById('paddle_r'));

        /* Declare all elements that are necessary for a pong game */
        this.app = document.getElementById('app');
        this.pauseMenu = document.getElementById('pause-window');
        this.countdownWindow = document.getElementById('countdown-window');
        this.countdownText = document.getElementById('countdown-text');
        this.continueButton = document.getElementById('continue-button');
        this.quitButton = document.getElementById('quit-button');
        this.finalScoreWindow = document.getElementById('score-window');

        /* hud elements for the pong game */
        this.hudWindow = document.querySelector('.hud');
        this.scoreLeftObj = document.getElementById('score_l');
        this.scoreLeftObj.innerHTML = '0';
        this.scoreRightObj = document.getElementById('score_r');
        this.scoreRightObj.innerHTML = '0';
        this.minutesObj = document.getElementById('minutes');
        this.secondsObj = document.getElementById('seconds');
        this.minutesObj.innerHTML = this.padTime(Math.floor(0));
        this.secondsObj.innerHTML = this.padTime(Math.floor(0));
        this.playerLeftID = document.getElementById('player_l_name');
        this.playerRightID = document.getElementById('player_r_name');

        /* elements for final score */
        this.options = options;;
        this.finalScoreMinutes = document.getElementById('minutes__final');
        this.finalScoreSeconds = document.getElementById('seconds__final');
        this.winnerName = document.getElementById('winner-name');
        this.looserName = document.getElementById('looser-name');
        this.winnerScore = document.getElementById('winner-score');
        this.looserScore = document.getElementById('looser-score');
        this.backHomeButton = document.getElementById('back-home-button');

        /* Declare variables for the game logic */
        this.gameRunning = true;
        this.startTime = 0;
        this.timerSeconds = 0;
        this.timeInterval = 0;
        this.loopInterval = 0;
        this.scoreLeft = 0;
        this.scoreRight = 0;
        this.paddleSpeed = INITIAL_PADDLE_SPEED;

        /* countdown variables */
        this.seconds = 5;
        this.countdownInterval = 0;

        /* variables for AI opponent */
        this.aiRefreshInterval = 0;
        this.aiUpdateInterval = 0;
        this.aiKeyDuration = 0;

        if (this.options.game_type === 'tournament') {
            this.playerLeftID.textContent = options.player_one;
            this.playerRightID.textContent = options.player_two;
            this.isAI = (options.player_two === 'AI');
        } else {
            this.isAI = (sessionStorage.getItem('opponent_name') === "AI");
            this.setPlayerNames();
        }
        this.resetPaddles();
        this.resetBall();

        if (document.getElementById('app').classList.contains('make-opaque')) {
            document.getElementById('app').classList.remove('make-opaque');
        }
        this.onGameOver = null;
        this.controller = new AbortController();
    }

    async run() {
        /* attach event listeners to be able to start the game */
        this.attachEventListeners();

        return new Promise((resolve) => {
            this.onGameOver = () => {
                resolve();
            };
        })
    }

    setPlayerNames() {
        /* set the name for the left player */
        this.playerOne = localStorage.getItem('username');
        if (!this.playerOne) {
            this.playerLeftID.textContent = 'Player 1';
        } else {
            this.playerLeftID.textContent = this.playerOne;
        }

        /* set the name for the right player */
        this.playerTwo = sessionStorage.getItem('opponent_name');
        if (!this.playerTwo) {
            this.playerRightID.textContent = 'Player 2';
        } else {
            this.playerRightID.textContent = this.playerTwo;
            if (!this.playerOne) {
                this.playerLeftID.textContent = 'Me';
            }
        }
    }

    getPauseMenuVisibility() {
        if (this.pauseMenu.classList.contains('hidden')) {
            return false;
        }
        return true;
    }

    attachEventListeners() {

        this.handleKeyDown = (event) => {
            if (event.key == 'Enter') {
                if (!this.countdownWindow.classList.contains('hidden')) return;
                if (!this.finalScoreWindow.classList.contains('hidden')) {
                    if (this.options.game_type !== 'tournament') {
                        this.removeEventListeners();
                        navigateTo('/');
                    }
                    return;
                }
                if (!this.loopInterval && !this.getPauseMenuVisibility()) {
                    this.countdown();
                } else if (this.getPauseMenuVisibility()) {
                    this.resumeGame();
                }
            }
            if (event.key == 'Escape') {
                if (this.countdownWindow.classList.contains('hidden') &&
                    this.finalScoreWindow.classList.contains('hidden') &&
                    (!this.pauseMenu.classList.contains('hidden') || this.loopInterval)) {
                    this.pauseGame();
                }
            }
            if (this.isAI == false) {
                if (event.key == 'ArrowUp') {
                    this.paddleRight.dy = -this.paddleSpeed;
                }
                if (event.key == 'ArrowDown') {
                    this.paddleRight.dy = this.paddleSpeed;
                }
            }
            if (event.key == 'w') {
                this.paddleLeft.dy = -this.paddleSpeed;
            }
            if (event.key == 's') {
                this.paddleLeft.dy = this.paddleSpeed;
            }
        }

        this.handleKeyUp = (event) => {
            if (!this.isAI && (event.key == 'ArrowUp' || event.key == 'ArrowDown')) {
                this.paddleRight.dy = 0
            }
            if (event.key == 'w' || event.key == 's') {
                this.paddleLeft.dy = 0
            }
        }

        this.handlePauseWindow = (e) => {
            const target = e.target;

            switch (target.id) {
                case 'continue-button':
                    this.resumeGame();
                    break;
                case 'quit-button':
                    sessionStorage.removeItem('opponent_name');
                    navigateTo('/');
                    break;
                default:
                    break;
            }
        }

        this.handleResize = () => {
            this.board.update();
        }

        this.handleBackHome = () => {
            this.resetGame();
        }

        /* add the event listeners */
        this.app.addEventListener('click', this.handlePauseWindow, { signal: this.controller.signal });
        this.backHomeButton.addEventListener('click', this.handleBackHome, { signal: this.controller.signal });
        document.addEventListener('keydown', this.handleKeyDown, { signal: this.controller.signal });
        document.addEventListener('keyup', this.handleKeyUp, { signal: this.controller.signal });
        window.addEventListener('resize', this.handleResize, { signal: this.controller.signal });
    }

    removeEventListeners() {
        /* remove the event listeners for a clean exit */
        this.controller.abort();
    }

    resetPaddles() {
        const centerPos = (this.board.height - this.paddleLeft.height) * 0.5;
        this.paddleLeft.y = centerPos;
        this.paddleRight.y = centerPos;
        this.paddleLeft.object.style.top = centerPos + 'px';
        this.paddleRight.object.style.top = centerPos + 'px';
    }

    updateBall() {
        this.ball.object.style.left = this.ball.x + 'px';
        this.ball.object.style.top = this.ball.y + 'px';
    }

    logScores() {
        if (this.scoreLeft >= MAX_SCORE || this.scoreRight >= MAX_SCORE) {
            this.gameOver();
        } else {
            this.resetBall();
            this.resetPaddles();
        }
    }

    resetBall() {
        this.board.update();
        this.ball.x = this.board.width * 0.5 + this.board.left - this.ball.width * 0.5;
        this.ball.y = this.board.height * 0.5 + this.board.top - this.ball.height * 0.5;
        this.updateBall();
        this.aiKeyDuration = 0;
    }

    updatePaddle(paddle) {
        if (paddle.dy == 0) {
            return;
        }
        let newPos = 0;
        if (paddle.dy < 0) {
            newPos = Math.max(this.board.top, paddle.y);
        } else if (paddle.dy > 0) {
            let bounds = paddle.object.getBoundingClientRect();
            newPos = Math.min(this.board.bottom - bounds.height, paddle.y);
        }
        paddle.y = newPos;
        paddle.object.style.top = newPos + 'px';
    }

    getPaddleInnerBorder() {
        let boundsLeft = this.paddleLeft.object.getBoundingClientRect();
        let boundsRight = this.paddleRight.object.getBoundingClientRect();
        return {
            left: boundsLeft.x + this.paddleLeft.width - BALL_BOUNCE_DEPTH,
            right: boundsRight.x + BALL_BOUNCE_DEPTH
        };
    }

    getCenterPoint(obj) {
        let bounds = obj.getBoundingClientRect();
        let x = bounds.width * 0.5 + bounds.left;
        let y = bounds.height * 0.5 + bounds.top;
        return { x: x, y: y };
    }

    intersectLine(lineX, pointX, newPointX) {
        return (Math.sign(lineX - pointX) != Math.sign(lineX - newPointX));
    }

    ballIsOnPaddle(paddle, center, newCenter) {
        let paddleBounds = paddle.object.getBoundingClientRect();
        return ((center.y > paddleBounds.top && center.y < paddleBounds.bottom) ||
            (newCenter.y > paddleBounds.top && newCenter.y < paddleBounds.bottom));
    }

    moveBall() {
        let newLeft = this.ball.x + this.ball.dx;
        let newTop = this.ball.y + this.ball.dy;

        if (newLeft > this.board.right - this.ball.width) {
            this.scoreLeft++;
            this.scoreLeftObj.innerHTML = this.scoreLeft;
            this.logScores();
            this.stopGame();
            return;
        } else if (newLeft < this.board.left) {
            this.scoreRight++;
            this.scoreRightObj.innerHTML = this.scoreRight;
            this.logScores();
            this.stopGame();
            return;
        }

        if (newTop < this.board.top) {
            this.ball.dy = -this.ball.dy;
            newTop = this.board.top - newTop + this.board.top;
        } else if (newTop > this.board.bottom - this.ball.height) {
            this.ball.dy = -this.ball.dy;
            newTop = this.board.bottom - this.ball.height - newTop + (this.board.bottom - this.ball.height);
        }

        let centerPoint = this.getCenterPoint(this.ball.object);
        let centerPointNew = { x: centerPoint.x + this.ball.dx, y: centerPoint.y + this.ball.dy };

        let paddleBorderX = this.getPaddleInnerBorder();
        if ((this.intersectLine(paddleBorderX.left, this.ball.x, newLeft) &&
            this.ballIsOnPaddle(this.paddleLeft, centerPoint, centerPointNew) ||
            (this.intersectLine(paddleBorderX.right, this.ball.x + this.ball.width, newLeft + this.ball.width) &&
                this.ballIsOnPaddle(this.paddleRight, centerPoint, centerPointNew)))) {
            this.ball.dx = -this.ball.dx;
            if (this.ball.dx < 0) {
                this.ball.dx -= Math.round(Math.random() * 2);
            } else {
                this.ball.dx += Math.round(Math.random() * 2);
            }
            if (this.ball.dy < 0) {
                this.ball.dy -= Math.round(Math.random() * 2);
            } else {
                this.ball.dy += Math.round(Math.random() * 2);
            }
            this.paddleSpeed += Math.round(Math.random());
            newLeft = this.ball.x + this.ball.dx;
        }

        this.ball.x = newLeft;
        this.ball.y = newTop;
        this.updateBall();
    }

    padTime(num) {
        let s = '00' + num;
        return s.substring(s.length - 2);
    }

    updateTime() {
        let now = new Date().getTime();
        let millisPassed = now - this.startTime;
        let gameSeconds = this.timerSeconds + millisPassed / 1000;
        this.minutesObj.innerHTML = this.padTime(Math.floor(gameSeconds / 60));
        this.secondsObj.innerHTML = this.padTime(Math.floor(gameSeconds % 60));
    }

    loop() {
        this.paddleLeft.y += this.paddleLeft.dy;
        this.paddleRight.y += this.paddleRight.dy;
        this.updatePaddle(this.paddleLeft);
        this.updatePaddle(this.paddleRight);
        this.moveBall();
    }

    countdown() {
        this.countdownWindow.classList.remove('hidden');
        this.countdownInterval = window.setInterval(() => this.decrementCountdown(), 1000);
        this.decrementCountdown();
    }

    decrementCountdown() {
        this.countdownText.innerHTML = this.seconds + '';
        if (this.seconds === 0) {
            window.clearInterval(this.countdownInterval);
            this.countdownWindow.classList.add('hidden');
            this.startGame();
        } else {
            this.seconds--;
        }
    }

    refreshAI() {
        let dx = this.ball.dx;
        let dy = this.ball.dy;
        if (!this.loopInterval || dx == 0) {
            return;
        }

        let paddleBorderX = this.getPaddleInnerBorder();

        let halfBall = this.ball.height / 2;
        let current = this.getCenterPoint(this.ball.object);
        let paddleCenterY = this.paddleRight.y + (this.paddleRight.height / 2);
        let newY = paddleCenterY;
        let timeToWall = 0;

        while (current.x + halfBall < paddleBorderX.right) {
            if (dx > 0) { // ball moving to the right
                timeToWall = (paddleBorderX.right - (current.x + halfBall)) / dx;
                newY = current.y + timeToWall * dy;
                if (newY > this.board.top + halfBall && newY < this.board.bottom - halfBall) {
                    break;
                }
            } else { // moving to the left
                timeToWall = (paddleBorderX.left - (current.x - halfBall)) / dx;
                newY = current.y + timeToWall * dy;
                if (newY > this.board.top + halfBall && newY < this.board.bottom - halfBall) {
                    current.x += timeToWall * dx;
                    current.y = newY;
                    dx = -dx;
                    continue;
                }
            }
            timeToWall = 0;
            if (dy < 0) { // ball moving up
                timeToWall = (this.board.top - (current.y - halfBall)) / dy;
            } else if (dy > 0) { // ball moving dowm
                timeToWall = (this.board.bottom - (current.y + halfBall)) / dy;
            }
            current.x += timeToWall * dx;
            current.y += timeToWall * dy;
            dy = -dy;
        }

        // amount of loops required to move the paddle to the newY, UP(+) / DOWN(-)
        this.aiKeyDuration = (paddleCenterY - newY) / Math.abs(this.paddleSpeed) - 1 + 2 * Math.random();
        this.aiKeyDuration = Math.sign(this.aiKeyDuration) * Math.floor(Math.abs(this.aiKeyDuration));

        let now = new Date().getTime();
        let secPassed = (now - this.startTime) / 1000;
        let failure = ((this.scoreRight - this.scoreLeft) / MAX_SCORE) - (this.scoreLeft / MAX_SCORE) + (secPassed / 42);
        // failure is higher means AI is more likely to fail and easier to win against
        // first the difference between the scores relative to the MAX_SCORE is calculated, so it's harder the greater the difference
        // then we subtract the relative left score, so it's harder the higher the players score is
        // lastly we add a time factor, so the AI gets easier the longer the game takes
        // console.log(failure);
        if (Math.random() < failure) {
            this.aiKeyDuration = -this.aiKeyDuration;
        }
    }

    loopAI() {
        // Sets velocity so that paddle moves up if aiKeyDuration is positive and vice versa
        this.paddleRight.dy = -Math.sign(this.aiKeyDuration) * this.paddleSpeed;
        this.aiKeyDuration -= Math.sign(this.aiKeyDuration);
    }

    startTimer() {
        if (!this.startTime) {
            this.startTime = new Date().getTime();
            this.updateTime();
            this.timeInterval = window.setInterval(() => this.updateTime(), 500);
        }
    }

    stopTimer() {
        window.clearInterval(this.timeInterval);
        this.timeInterval = 0;
        let now = new Date().getTime();
        let millisPassed = now - this.startTime;
        this.timerSeconds += millisPassed / 1000;
        this.startTime = 0;
    }

    startGame() {
        this.ball.dx = (Math.max(this.scoreLeft, this.scoreRight) + 5) * (Math.random() < 0.5 ? -1 : 1);
        this.ball.dy = (Math.floor(Math.random() * 2) + 1) * (Math.random() < 0.5 ? -1 : 1);
        this.resumeGame()
    }

    stopGame() {
        if (this.loopInterval) {
            this.stopTimer();
            window.clearInterval(this.loopInterval);
            this.loopInterval = 0;
            this.paddleSpeed = INITIAL_PADDLE_SPEED;
            if (this.isAI) {
                window.clearInterval(this.aiRefreshInterval);
                window.clearInterval(this.aiUpdateInterval);
                this.aiRefreshInterval = 0;
                this.aiUpdateInterval = 0;
            }
        }
    }

    resetGame() {
        this.stopGame();
        this.removeEventListeners();
    }

    pauseGame() {
        if (this.loopInterval) {
            this.stopTimer();
            window.clearInterval(this.loopInterval);
            this.loopInterval = 0;
            this.paddleSpeed = INITIAL_PADDLE_SPEED;
            if (this.isAI) {
                window.clearInterval(this.aiUpdateInterval);
                this.aiUpdateInterval = 0;
            }
        }
        if (!this.getPauseMenuVisibility()) {
            this.showGamePauseMenu();
        }
    }


    hideGamePauseMenu() {
        const pauseMenu = document.getElementById('pause-window');
        pauseMenu.classList.add("hidden");
    }

    showGamePauseMenu() {
        const pauseMenu = document.getElementById('pause-window');
        pauseMenu.classList.remove("hidden");
    }

    resumeGame() {
        this.hideGamePauseMenu();
        if (this.isAI) {
            this.aiRefreshInterval = window.setInterval(() => this.refreshAI(), AI_INTERVAL);
            this.aiUpdateInterval = window.setInterval(() => this.loopAI(), INTERVAL);
        }
        this.loopInterval = window.setInterval(() => this.loop(), INTERVAL);
        this.startTimer();
    }

    gameOver() {
        this.gameRunning = false;
        this.stopGame();
        this.resetBall();

        this.finalScoreUpdate();

        if (getLoggedIn() && this.options.game_type === 'single') {
            let raw = JSON.stringify({
                "opponent": this.playerTwo,
                "own_score": this.scoreLeft,
                "opponent_score": this.scoreRight,
                "win": this.scoreLeft > this.scoreRight,
                "game_id": this.options.game_id
            });

            const header = getDefaultHeader();

            if (navigator.onLine) {
                fetch(POST_SCORE_API, {
                    method: 'POST',
                    headers: header,
                    body: raw,
                    signal: AbortSignal.timeout(5000)
                })
                    .then(response => {

                        if (!response.ok) {
                            // console.error('API error:', response.status, response.statusText);
                            return response.json();
                        }
                    })
                    .then(data => {
                        if (data) {
                            toastErrorMessage(data.opponent[0]);
                        }
                    })
                    .catch(error => {
                        toastErrorMessage('Could not post game score.');
                        // console.log('error', error);
                    });
            } else {
                toastErrorMessage('Could not post game score.');
            }

            sessionStorage.removeItem('opponent_name');
        } else if (this.options.game_type === 'tournament') {
            this.removeEventListeners();
        }
        this.onGameOver();
    }

    finalScoreUpdate() {
        this.finalScoreMinutes.innerHTML = this.minutesObj.innerHTML;
        this.finalScoreSeconds.innerHTML = this.secondsObj.innerHTML;

        this.hudWindow.classList.add('hidden');
        this.finalScoreWindow.classList.remove('hidden');
        this.ball.object.classList.add('hidden');

        if (this.scoreLeft > this.scoreRight) {
            this.winnerName.textContent = this.playerLeftID.textContent;
            this.looserName.textContent = this.playerRightID.textContent;
            this.winnerScore.textContent = this.scoreLeft.toString();
            this.looserScore.textContent = this.scoreRight.toString();
        } else {
            this.looserName.textContent = this.playerLeftID.textContent;
            this.winnerName.textContent = this.playerRightID.textContent;
            this.looserScore.textContent = this.scoreLeft.toString();
            this.winnerScore.textContent = this.scoreRight.toString();
        }
    }
}

let currentPongGame = null;
let gameObject = null;

const createNewSingleGame = async () => {
    const header = getDefaultHeader();
    const raw = JSON.stringify({
        "game_type": "single"
    });

    if (navigator.onLine) {
        try {
            const response = await fetch(POST_GAME_ID, {
                method: 'POST',
                headers: header,
                body: raw,
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            toastErrorMessage('Timeout for creating a new game ID');
            // console.error('Error creating single game:', error);
            throw error;
        }
    } else {
        toastErrorMessage('Could not create game ID');
        throw error;
    }
}

export const startPongGame = async (options) => {
    let gameOptions = null;
    if (currentPongGame) {
        currentPongGame.resetGame();
        currentPongGame = null;
        gameObject = null;
    }
    if (!options) {
        if (getLoggedIn()) {
            try {
                gameObject = await createNewSingleGame();
                gameOptions = {
                    game_type: gameObject.game_type,
                    game_id: gameObject.id
                };
            } catch (error) {
                // console.error('Error creating game ID:', error);
                gameOptions = {
                    game_type: 'single'
                };
            }
        } else {
            gameOptions = {
                game_type: 'single'
            };
        }
    } else {
        gameOptions = {
            game_type: options.game_type,
            player_one: options.player_one,
            player_two: options.player_two,
            game_id: options.game_id
        };
    }


    currentPongGame = new PongGame(gameOptions);

    return currentPongGame.run().then(() => ({
        'left': currentPongGame.scoreLeft,
        'right': currentPongGame.scoreRight
    }));
};
