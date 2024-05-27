import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Match History");
    }

    getHtml = async () => {
    return `
    <div class="window">
        <div class="topbar">
        <button id="back-button" onclick="history.back()" class="icon-button">
            <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;">
        </button>
        <div class="title">Match History</div>
        <a href="/" class="icon-button" data-link>
            <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;">
        </a>
        </div>
        <div class="content">
        <div class="match-list">
            <div class="scroll-matches">
            <div class="list-item">
                <div class="match-icon">S</div>
                <div class="match-date">28.08.28 08:58</div>
                <img class="trophy" src="./static/media/trophy-gold.svg" draggable="false" (dragstart)="false;">
                <div class="match-result">
                <div class="left-player">Aaron Rabenstein</div>
                <div class="score">
                    <div class="left-score">11</div>
                    <div class="score-colon">:</div>
                    <div class="right-score">8</div>
                </div>
                <div class="right-player">Markuz Kurz</div>
                </div>
            </div>
            <div class="list-item">
                <button class="match-button">T</button>
                <div class="match-date">21.04.24 16:04</div>
                <img class="trophy" src="./static/media/trophy-gold.svg" draggable="false" (dragstart)="false;">
                <div class="match-result">
                <div class="tournament-place">1st</div>
                <div class="match-text">out of</div>
                <div class="tournament-players">5</div>
                <div class="match-text"> players</div>
                </div>
            </div>
            </div>
        </div>
        </div>
        </div>
    </div>
        `
    }
}