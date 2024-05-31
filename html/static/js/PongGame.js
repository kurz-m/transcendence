import { navigateTo } from "./index.js";

const FPS = 60;
const INTERVAL = 1000 / FPS;
const INITIAL_PADDLE_SPEED = 12;

class PongGame {
    constructor() {

        /* Declare the Board class */
        class Board {
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
        this.board = new Board(document.getElementById("board"));
        
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
        this.ball = new this.Ball(document.getElementById("ball"));

        /* Declare the Paddle class */
        class Paddle {
            constructor(object) {
                this.object = object;
                let bounds = object.getBoundingClientRect();
                this.width = bounds.width;
                this.height = bounds.height;
                this.y = bounds.y;
                this.dy = 0;
            }
        }
        this.paddleLeft = new Paddle(document.getElementById("paddle_l"));
        this.paddleRight = new Paddle(document.getElementById("paddle_r"));


        /* Declare all elements that are necessary for a pong game */
        this.scoreLeftObj = document.getElementById("score_l");
        this.scoreRightObj = document.getElementById("score_r");
        this.minutesObj = document.getElementById("minutes");
        this.secondsObj = document.getElementById("seconds");
        this.pauseMenu = document.getElementById("PauseMenu");
        this.countdownWindow = document.getElementById("CountdownWindow");
        this.countdownText = document.getElementById("CountdownText");
        this.continueButton = document.getElementById("PauseContinueButton").
        this.quitButton = document.getElementById("PauseMenuQuitButton").

        /* Declare variables for the game logic */
        this.gameRunning = false;
        this.startTime = 0;
        this.timeInterval = 0;
        this.loopInterval = 0;
        this.scoreLeft = 0;
        this.scoreRight = 0;
        this.paddleSpeed = INITIAL_PADDLE_SPEED;
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
                if (!this.gameRunning) {
                    navigateTo('/');
                } else if (!this.loopInterval && !this.getPauseMenuVisibility()) {
                    // TODO: implement this function
                    this.countdown();
                } else if (this.getPauseMenuVisibility()) {
                    // TODO: implement this function
                    this.resumeGame();
                }
            }
            if (event.key == 'Escape') {
                // TODO: implement this function
                this.pauseGame();
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

        this.handlePauseContinue = () => {
            // TODO: implement this function
            this.resumeGame();
        }

        this.handlePauseQuit = () => {
            // TODO: add a delete method if the game is quit early
            navigateTo('/');
        }

        this.handleResize = () => {
            this.board.update();
        }

        /* add the event listeners */
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
        this.continueButton.addEventListener("click", this.handlePauseContinue);
        this.quitButton.addEventListener("click", this.handlePauseQuit);
        window.addEventListener("resize", this.handleResize);
    }

    removeEventListeners() {
        /* remove the event listeners for a clean exit */
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);
        this.continueButton.removeEventListener("click", this.handlePauseContinue);
        this.quitButton.removeEventListener("click", this.handlePauseQuit);
        window.removeEventListener("resize", this.handleResize);
    }
}