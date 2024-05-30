import { showGamePauseMenu, hideGamePauseMenu } from "./shared.js";
import { navigateTo } from "./index.js";
import { getUsername } from "./authentication.js";

export const setOpponent = name => {
    sessionStorage.setItem('opponent_name', name);
}

let gameType = "single";
export const setGameType = type => {
    gameType = type;
}

let gameRunning = true;

let scoreAPI = 'https://transcendence.myprojekt.tech/api/score'

export const pongGame = () => {

    const player_l_name_obj = document.getElementById("player_l_name");
    const player_r_name_obj = document.getElementById("player_r_name");

    player_l_name_obj.textContent = getUsername();
    player_r_name_obj.textContent = sessionStorage.getItem('opponent_name');
    
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
    
    class Ball {
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
    
    const FPS = 60;
    const INTERVAL = 1000 / FPS; // interval in ms
    
    var loopInterval = 0;
    
    var score_l = 0;
    var score_r = 0;
    
    const INITIAL_PADDLE_SPEED = 12;
    var paddle_speed = INITIAL_PADDLE_SPEED;
    const board = new Board(document.getElementById("board"));
    
    const paddle_l = new Paddle(document.getElementById("paddle_l"));
    const paddle_r = new Paddle(document.getElementById("paddle_r"));
    const ball = new Ball(document.getElementById("ball"));
    const score_l_obj = document.getElementById("score_l");
    const score_r_obj = document.getElementById("score_r");
    const minutes_obj = document.getElementById("minutes");
    const seconds_obj = document.getElementById("seconds");
    var startTime = 0;
    var timeInterval = 0;
    
    function resetPaddles() {
        const centerPos = (board.height - paddle_l.height) * 0.5;
        paddle_l.y = centerPos;
        paddle_r.y = centerPos;
        paddle_l.object.style.top = centerPos + "px";
        paddle_r.object.style.top = centerPos + "px";
    }

    resetPaddles();
    resetBall();

    function updatePaddle(paddle) {
        if (paddle.dy == 0) {
            return;
        }
        var new_pos;
        if (paddle.dy < 0) {
            new_pos = Math.max(board.top, paddle.y);
        }
        else if (paddle.dy > 0) {
            var bounds = paddle.object.getBoundingClientRect();
            new_pos = Math.min(board.bottom - bounds.height, paddle.y);
        }
        paddle.y = new_pos;
        paddle.object.style.top = new_pos + "px";
    }
    
    function getCenterPoint(obj) {
        var bounds = obj.getBoundingClientRect();
        var x = bounds.width / 2 + bounds.left;
        var y = bounds.height / 2 + bounds.top;
        return { x: x, y: y };
    }
    
    function updateBall() {
        ball.object.style.left = ball.x + "px";
        ball.object.style.top = ball.y + "px";
    }
    
    function logScores() {
        // console.log("score: " + score_l + " : " + score_r);
        if (score_l >= 3 || score_r >= 3) {
            gameOver();
        }
        resetBall();
        resetPaddles();
    }
    
    function intersectPaddle(obj, center, center_new) {
        var bounds = obj.getBoundingClientRect();
        var paddle_center_h = bounds.left + bounds.width / 2;
        if (Math.sign(paddle_center_h - center.x) != Math.sign(paddle_center_h - center_new.x)) {
            if ((center.y > bounds.top && center.y < bounds.bottom) || 
                (center_new.y > bounds.top && center_new.y < bounds.bottom)) {
                return true;
            }
        }
        return false;
    }
    
    function moveBall() {
        // new positions
        var new_left = ball.x + ball.dx;
        var new_top = ball.y + ball.dy;
        // check if ball exits to the left or the right; count scores.
        if (new_left > board.right - ball.width) {
            score_l++;
            score_l_obj.innerHTML = score_l;
            logScores();
            stopGame();
            return;
        } else if (new_left < board.left) {
            score_r++;
            score_r_obj.innerHTML = score_r;
            logScores();
            stopGame();
            return;
        }
        // check if ball hits top or bottom wall.
        if (new_top < board.top) {
            ball.dy = -ball.dy;
            new_top = board.top - new_top + board.top;
        } else if (new_top > board.bottom - ball.height) {
            ball.dy = -ball.dy;
            new_top = board.bottom - ball.height - new_top + (board.bottom - ball.height);
        }
        // check if ball hits a paddle
        var center_point = getCenterPoint(ball.object);
        var center_point_new = { x: center_point.x + ball.dx, y: center_point.y + ball.dy };
        
        if (intersectPaddle(paddle_l.object, center_point, center_point_new) || 
            intersectPaddle(paddle_r.object, center_point, center_point_new)) {
            ball.dx = -ball.dx;
            if (ball.dx < 0)
                ball.dx -= Math.round(Math.random() * 2);
            else
                ball.dx += Math.round(Math.random() * 2);
            if (ball.dy < 0)
                ball.dy -= Math.round(Math.random() * 2);
            else
                ball.dy += Math.round(Math.random() * 2);
            paddle_speed += Math.round(Math.random() * 1);
            // console.log("ball dx: " + ball.dx + "   ball dy: " + ball.dy);
            new_left = ball.x + ball.dx;
        }
        ball.x = new_left;
        ball.y = new_top;
        updateBall();
    }
    
    function getPauseMenuVisible() {
        const PauseMenu = document.getElementById("PauseMenu");
        if (PauseMenu.classList.contains("hidden"))
            return false;
        return true;
    }

    function resetBall() {
        board.update();
        ball.x = board.width / 2 + board.left - ball.width / 2;
        ball.y = board.height / 2 + board.top - ball.height / 2;
        updateBall();
    }
    
    function pad(num) {
        var s = "00" + num;
        return s.substr(s.length-2);
    }
    
    function updateTime() {
        var now = new Date().getTime();
        var millis_passed = now - startTime;
        minutes_obj.innerHTML = pad(Math.floor(millis_passed / 1000 / 60));
        seconds_obj.innerHTML = pad(Math.floor((millis_passed / 1000) % 60));
    }
    
    function loop() {
        paddle_l.y += paddle_l.dy;
        paddle_r.y += paddle_r.dy;
        updatePaddle(paddle_l);
        updatePaddle(paddle_r);
        moveBall();
    }
    
    var seconds = 5;
    var countdownInterval;
    const countdownWindow = document.getElementById("CountdownWindow");
    const countdownText = document.getElementById("CountdownText");

    function decrementCountdown() {
        countdownText.innerHTML = seconds + "";
        if (seconds === 0) {
            window.clearInterval(countdownInterval);
            countdownWindow.classList.add("hidden");
            startGame();
        } else {
            seconds--;
        }
    }

    function countdown() {
        countdownWindow.classList.remove("hidden");
        countdownInterval = window.setInterval(decrementCountdown, 1000);
        decrementCountdown();
    }

    function startGame() {
        if (!startTime) {
            startTime = new Date().getTime();
            updateTime();
            timeInterval = window.setInterval(updateTime, 500);
        }
        ball.dx = (Math.floor(Math.random() * 4) + 3) * (Math.random() < 0.5 ? -1 : 1);
        ball.dy = (Math.floor(Math.random() * 4) + 3) * (Math.random() < 0.5 ? -1 : 1);
        // console.log("ball dx: " + ball.dx + "   ball dy: " + ball.dy);
        loopInterval = window.setInterval(loop, INTERVAL);
    }
    
    function pauseGame() {
        stopGame();
        if (!getPauseMenuVisible()) {
            showGamePauseMenu();
        }
    }

    function stopGame() {
        if (loopInterval) {
            window.clearInterval(loopInterval);
            loopInterval = 0;
            paddle_speed = INITIAL_PADDLE_SPEED;
        }
    }
    
    function resumeGame() {
        hideGamePauseMenu();
        loopInterval = window.setInterval(loop, INTERVAL);
    }

    function gameOver() {
        gameRunning = false;
        stopGame();
        resetBall();
        window.clearInterval(timeInterval);
        minutes_obj.innerHTML = "00";
        seconds_obj.innerHTML = "00";

        const scoreWindow = document.getElementById("FinalScore");
        scoreWindow.classList.remove("hidden");
        ball.object.classList.add("hidden");

        let raw = JSON.stringify({
            "opponent": sessionStorage.getItem('opponent_name'),
            "own_score": score_l,
            "opponent_score": score_r,
            "win": score_l > score_r,
            "game_type": gameType,
            "tournament_id": sessionStorage.getItem('tournament_id'),
        });

        fetch(scoreAPI, {
            method: 'POST',
            body: raw
        })
        .then(response => {
            console.log(response.text());
        })
        // TODO: show error on score window + try again button?!
        .catch(error => console.log('error', error));

    }
    
    document.addEventListener("keydown", (event) => {
        if (event.key == "Enter") {
            if (!gameRunning) {
                navigateTo("/");
            } else if (!loopInterval && !getPauseMenuVisible()) {
                countdown();
            } else if (getPauseMenuVisible()) {
                resumeGame();
            }
        }
        if (event.key == "Escape") {
            pauseGame();
        }
        if (event.key == "ArrowUp") {
            paddle_r.dy = -paddle_speed;
        }
        if (event.key == "ArrowDown") {
            paddle_r.dy = paddle_speed;
        }
        if (event.key == "w") {
            paddle_l.dy = -paddle_speed;
        }
        if (event.key == "s") {
            paddle_l.dy = paddle_speed;
        }
    });
    
    document.addEventListener("keyup", (event) => {
        if (event.key == "ArrowUp" || event.key == "ArrowDown") {
            paddle_r.dy = 0;
        }
        if (event.key == "w" || event.key == "s") {
            paddle_l.dy = 0;
        }
    });
    
    document.getElementById("PauseContinueButton").addEventListener("click", () => {
        resumeGame();
    });

    document.getElementById("PauseMenuQuitButton").addEventListener("click", () => {
        navigateTo("/");
    });

    window.addEventListener("resize", () => {
        board.update();
    });
}
