import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Pong Game");
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
            <div id="minutes" class="hud-time-text">00</div>
            <div class="hud-time-text">:</div>
            <div id="seconds" class="hud-time-text">00</div>
            </div>
        </div>

        <div id="PauseMenu" class="window hidden">
            <div class="title">Paused</div>
            <div class="content">
            <button id="PauseMenuQuitButton" class="large-button-red">Quit</button>
            <button id="PauseContinueButton" class="large-button">Continue</button>
            </div>
        </div>

        <div id="FinalScore" class="window hidden">
            <div class="title">Final Score</div>
            <div class="content">
            <a href="/" class="large-button" data-link>Close</a>
            <div id="ScoreContent">Result</div>
            </div>
        </div>

        <div id="GameAnnounce" class="window hidden">
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
                <button class="clean-button">
                    <img class="small-icon" src="../media/swap.svg" alt="Swap">
                </button>
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

        <div id="CountdownWindow" class="window hidden">
            <div id="CountdownText" class="countdown">5</div>
        </div>
        `
    }
}