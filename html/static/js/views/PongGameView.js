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
            <div id="player_l_name" class="hud-player-left"></div>
            <div class="hud-score">
                <div id="score_l" class="hud-score-left">0</div>
                <div class="hud-score-colon">:</div>
                <div id="score_r" class="hud-score-right">0</div>
            </div>
            <div id="player_r_name" class="hud-player-right"></div>
            </div>
            <div class="hud-time">
            <div id="minutes" class="hud-time-text">10</div>
            <div class="hud-time-text">:</div>
            <div id="seconds" class="hud-time-text">31</div>
            </div>
        </div>
        `
    }
}