import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Pong Menu");
    }

    getHtml = async () => {
        return `
            <div class="window">
                <div class="topbar">
                <button id="back-button" onclick="history.back()" class="icon-button">
                    <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;">
                </button>
                <div class="title">Pong</div>
                <a href="/" class="icon-button" data-link>
                    <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;">
                </a>
                </div>
                <div class="content">
                <a href="/pong-single" class="a-large-button" data-link>Single Game</a>
                <a href="/pong-tournament" class="a-large-button" data-link>Tournament</a>
                </div>
            </div>
        `
    }
}