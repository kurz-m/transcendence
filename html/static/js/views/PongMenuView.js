import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Pong Menu");
        this.loginButton = document.getElementById('login-button');
        if (this.loginButton.classList.contains('make-opaque')) {
            this.loginButton.classList.remove('make-opaque');
        }
    }

    getHtml = async () => {
        return `
        <div class="window">
            <div class="topbar">
                <button id="back-button" onclick="history.back()" class="icon-button">
                    <i class="bi bi-caret-left-fill"></i>
                </button>
                <div class="title">Pong</div>
                <a href="/" class="icon-button" (dragstart)="false;" draggable="false" data-link>
                    <i class="bi bi-house-fill"></i>
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