import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Tournament");
        document.getElementById('login-button').classList.add('hidden');
    }

    getHtml = async () => {
    return `
    <div id="paddle_l" class="paddle_l"></div>
    <div id="paddle_r" class="paddle_r"></div>
    <div id="ball" class="ball"></div>

    <div id="hud-window" class="hud hidden">
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

    <div id="final-score-window" class="window hidden">
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

            <button id="next-game-button" class="large-button">Next Game</button>
        </div>
    </div>

    <div id="announce-window" class="window hidden">
        <div class="title">Next Game</div>
        <div class="content">
            <div class="h-content">
                <div class="announce-player">
                    <div id="announce-left" class="subheading">Player 1</div>
                    <div class="controls">
                        <div class="small-text">Controls:</div>
                        <div class="small-text-bold">WS</div>
                    </div>
                </div>
                <div class="announce-vs">
                    <div class="subheading">vs.</div>
                </div>
                <div class="announce-player">
                    <div id="announce-right" class="subheading">Player 2</div>
                    <div class="controls">
                        <div class="small-text">Controls:</div>
                        <div class="small-text-bold">↑↓</div>
                    </div>
                </div>
            </div>
            <button id="announce-play-button" class="large-button">Play</button>
        </div>
    </div>

    <div id="countdown-window" class="window hidden">
        <div id="countdown-text" class="countdown">5</div>
    </div>

    <div id="back-home-button" class="hidden"></div>

    <div id="tournament-window" class="window">
        <div class="topbar">
            <button id="back-button" onclick="history.back()" class="icon-button">
                <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;" />
            </button>
            <div class="title">Tournament</div>
            <a href="/" class="icon-button" data-link>
                <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;" />
            </a>
        </div>

        <div class="content">
            <div class="h-content">
                <div class="v-content">
                    <div class="people-list">
                        <div class="scroll-people"></div>
                    </div>
                    <div class="label-field-button">
                        <input id="player-input" class="text-field" type="text" placeholder="name" />
                        <button id="add-player" class="small-button">add</button>
                    </div>
                </div>
                <div class="v-content">
                    <div class="ai-selection">
                        <div class="subheading">AI</div>
                        <div class="h-content">
                            <div class="large-text">2</div>
                            <div class="stepper">
                                <button class="stepper-inc">
                                    <div class="stepper-text-inc">+</div>
                                </button>
                                <!-- <hr class="stepper-divider"> -->
                                <button class="stepper-dec">
                                    <div class="stepper-text-dec">-</div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="v-spacer"></div>
                    <div id="total-players" class="small-text">Total Players: 0</div>
                    <button id="start-tournament" class="large-button">Play</button>
                </div>
            </div>
        </div>
    </div>
    `
    }

    afterRender = async () => {
        document.querySelector('#ball').classList.add('hidden');
    }
}
