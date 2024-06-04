import { getLoggedIn } from "./authentication.js";
import { navigateTo } from "./index.js";
import { showGamePauseMenu, hideGamePauseMenu, getDefaultHeader } from "./shared.js";

const FPS = 60;
const INTERVAL = 1000 / FPS;
const INITIAL_PADDLE_SPEED = 12;

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
        this.Ball = (function(board) {
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
        this.timeInterval = 0;
        this.loopInterval = 0;
        this.scoreLeft = 0;
        this.scoreRight = 0;
        this.paddleSpeed = INITIAL_PADDLE_SPEED;

        /* countdown variables */
        this.seconds = 5;
        this.countdownInterval = 0;

        if (this.options.game_type === 'tournament') {
            this.playerLeftID.textContent = options.player_one;
            this.playerRightID.textContent = options.player_two;
        } else {
            this.setPlayerNames();
        }
        this.resetPaddles();
        this.resetBall();

        this.onGameOver = null;
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
        const playerOne = localStorage.getItem('username');
        if (!playerOne) {
            this.playerLeftID.textContent = 'Player 1';
        } else {
            this.playerLeftID.textContent = playerOne;
        }

        /* set the name for the right player */
        const playerTwo = sessionStorage.getItem('opponent_name');
        if (!playerTwo) {
            this.playerRightID.textContent = 'Player 2';
        } else {
            this.playerRightID.textContent = playerTwo;
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
                    this.finalScoreWindow.classList.contains('hidden')) {
                    this.pauseGame();
                }
            }
            if (event.key == 'ArrowUp') {
                this.paddleRight.dy = -this.paddleSpeed;
            }
            if (event.key == 'ArrowDown') {
                this.paddleRight.dy = this.paddleSpeed;
            }
            if (event.key == 'w') {
                this.paddleLeft.dy = -this.paddleSpeed;
            }
            if (event.key == 's') {
                this.paddleLeft.dy = this.paddleSpeed;
            }
        }

        this.handleKeyUp = (event) => {
            if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
                this.paddleRight.dy = 0
            }
            if (event.key == 'w' || event.key == 's') {
                this.paddleLeft.dy = 0
            }
        }

        this.handlePauseWindow = (e) => {
            const target = e.target;

            switch (target.id) {
                case 'PauseContinueButton':
                    this.resumeGame();
                    break;
                case 'PauseMenuQuitButton':
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
        this.app.addEventListener('click', this.handlePauseWindow);
        this.backHomeButton.addEventListener('click', this.handleBackHome);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('resize', this.handleResize);
    }

    removeEventListeners() {
        /* remove the event listeners for a clean exit */
        this.app.removeEventListener('click', this.handlePauseWindow);
        this.backHomeButton.removeEventListener('click', this.handleBackHome);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('resize', this.handleResize);
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
        if (this.scoreLeft >= 3 || this.scoreRight >= 3) {
            this.gameOver();
        }
        this.resetBall();
        this.resetPaddles();
    }

    resetBall() {
        this.board.update();
        this.ball.x = this.board.width * 0.5 + this.board.left - this.ball.width * 0.5;
        this.ball.y = this.board.height * 0.5 + this.board.top - this.ball.height * 0.5;
        this.updateBall();
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

    getCenterPoint(obj) {
        let bounds = obj.getBoundingClientRect();
        let x = bounds.width * 0.5 + bounds.left;
        let y = bounds.height * 0.5 + bounds.top;
        return { x: x, y: y };
    }

    intersectPaddle(obj, center, centerNew) {
        let bounds = obj.getBoundingClientRect();
        let paddleCenterHeight = bounds.left + bounds.width * 0.5;
        if (Math.sign(paddleCenterHeight - center.x) != Math.sign(paddleCenterHeight - centerNew.x)) {
            if ((center.y > bounds.top && center.y < bounds.bottom) ||
                (centerNew.y > bounds.top && centerNew.y < bounds.bottomw)) {
                return true;
            }
        }
        return false;
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

        if (this.intersectPaddle(this.paddleLeft.object, centerPoint, centerPointNew) ||
            this.intersectPaddle(this.paddleRight.object, centerPoint, centerPointNew)) {
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
        this.minutesObj.innerHTML = this.padTime(Math.floor(millisPassed * 0.001 / 60));
        this.secondsObj.innerHTML = this.padTime(Math.floor((millisPassed * 0.001) % 60));
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

    startGame() {
        if (!this.startTime) {
            this.startTime = new Date().getTime();
            this.updateTime();
            this.timeInterval = window.setInterval(() => this.updateTime(), 500);
        }
        this.ball.dx = (Math.floor(Math.random() * 4) + 3) * (Math.random() < 0.5 ? -1 : 1);
        this.ball.dy = (Math.floor(Math.random() * 4) + 3) * (Math.random() < 0.5 ? -1 : 1);
        this.loopInterval = window.setInterval(() => this.loop(), INTERVAL);
    }

    stopGame() {
        if (this.loopInterval) {
            window.clearInterval(this.loopInterval);
            this.loopInterval = 0;
            this.paddleSpeed = INITIAL_PADDLE_SPEED;
        }
    }

    resetGame() {
        if (this.loopInterval) {
            window.clearInterval(this.loopInterval);
            this.loopInterval = 0;
            this.paddleSpeed = INITIAL_PADDLE_SPEED;
        }
        this.removeEventListeners();
    }

    pauseGame() {
        this.stopGame();
        if (!this.getPauseMenuVisibility()) {
            showGamePauseMenu();
        }
    }

    resumeGame() {
        hideGamePauseMenu();
        this.loopInterval = window.setInterval(() => this.loop(), INTERVAL);
    }

    gameOver() {
        this.gameRunning = false;
        this.stopGame();
        this.resetBall();
        window.clearInterval(this.timeInterval);

        this.finalScoreUpdate();

        if (getLoggedIn() && this.options.game_type === 'single') {
            let raw = JSON.stringify({
                "opponent": this.playerRightID.textContent,
                "own_score": this.scoreLeft,
                "opponent_score": this.scoreRight,
                "win": this.scoreLeft > this.scoreRight,
                "game_id": this.options.game_id
            });

            const header = getDefaultHeader();

            fetch(POST_SCORE_API, {
                method: 'POST',
                headers: header,
                body: raw
            })
                .then(response => {
                    console.log(response.text());
                })
                .catch(error => console.log('error', error));

            sessionStorage.removeItem('opponent_name');
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

    try {
        const response = await fetch(POST_GAME_ID, {
            method: 'POST',
            headers: header,
            body: raw
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating single game:', error);
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
            } catch (error) {
                console.error('Error starting single game:', error);
                return;
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
