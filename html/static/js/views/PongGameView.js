import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Pong Game");
        document.getElementById('login-button').classList.add('hidden');
    }

    getHtml = async () => {
        return `
        <div id="paddle_l" class="paddle_l"></div>
        <div id="paddle_r" class="paddle_r"></div>
        <div id="ball" class="ball"></div>

        <div class="hud">
            <div class="hud-main">
                <div id="player_l_name" class="hud-player-left">Player 1</div>
                <div class="hud-score">
                    <div id="score_l" class="hud-score-left">0</div>
                    <div class="hud-score-colon">:</div>
                    <div id="score_r" class="hud-score-right">0</div>
                </div>
                <div id="player_r_name" class="hud-player-right">Player 2</div>
            </div>
            <div class="hud-time">
                <div id="minutes" class="hud-time-left">00</div>
                <div class="hud-time-colon">:</div>
                <div id="seconds" class="hud-time-right">00</div>
            </div>
        </div>

        <div id="pause-window" class="window hidden">
            <div class="title">Paused</div>
            <div class="content">
                <button id="quit-button" class="large-button-red">Quit</button>
                <button id="continue-button" class="large-button">Continue</button>
            </div>
        </div>

        <div id="score-window" class="window hidden">
            <div class="title">Game Over</div>
            <div class="game-result-time">
                <div id="minutes__final" class="hud-time-left">00</div>
                <div class="hud-time-colon">:</div>
                <div id="seconds__final" class="hud-time-right">00</div>
            </div>
            <div class="content">
                <div class="game-result">
                    <div class="game-result-player">
                        <img class="large-trophy" src="./static/media/trophy-gold.svg" draggable="false" (dragstart)="false;" />
                        <div id="winner-name" class="subheading">Player 1</div>
                    </div>
                    <div class="hud-score">
                        <div id="winner-score" class="hud-score-left">0</div>
                        <div class="hud-score-colon">:</div>
                        <div id="looser-score" class="hud-score-right">0</div>
                    </div>
                    <div class="game-result-player">
                        <img class="large-trophy" src="./static/media/loose.svg" draggable="false" (dragstart)="false;" />
                        <div id="looser-name" class="subheading">Player 2</div>
                    </div>
                </div>

                <a id="back-home-button" class="a-large-button" href="/" data-link>Back to Menu</a>
            </div>
        </div>

        <div id="announce-window" class="window hidden">
            <div class="title">Next Game</div>
            <div class="content">
                <div class="h-content">
                    <div class="announce-player">
                        <div class="subheading">Aaron</div>
                        <div class="controls">
                            <div class="small-text">Controls:</div>
                            <div class="small-text-bold">WS</div>
                        </div>
                    </div>
                    <div class="announce-vs">
                        <div class="subheading">vs.</div>
                    </div>
                    <div class="announce-player">
                        <div class="subheading">Sanjok</div>
                        <div class="controls">
                            <div class="small-text">Controls:</div>
                            <div class="small-text-bold">↑↓</div>
                        </div>
                    </div>
                </div>
                <button class="large-button">Play</button>
            </div>
        </div>

        <div id="countdown-window" class="window hidden">
            <div id="countdown-text" class="countdown">5</div>
        </div>
        `
    }
}
