import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Single Game");
    }

    getHtml = async () => {
        return `
        <div class="window">
            <div class="topbar">
            <button id="back-button" onclick="history.back()" class="icon-button">
                <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;">
            </button>
            <div class="title">Single Game</div>
            <a href="/" class="icon-button" data-link>
                <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;">
            </a>
            </div>
            <div class="content">
            <button class="large-button">Play vs AI</button>
            <div class="label-field-button">
                <div class="label">Play vs</div>
                <input class="text-field" type="text" placeholder="Guest">
                <a href="/pong-game" class="small-button">play</a>
            </div>
            </div>
        </div>
        `
    }
}