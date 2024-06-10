import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Single Game");
        this.controller = new AbortController();
    }

    getHtml = async () => {
        return `
        <div class="window">
            <div class="topbar">
                <button id="back-button" onclick="history.back()" class="icon-button">
                    <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;" />
                </button>
                <div class="title">Single Game</div>
                <a href="/" class="icon-button" data-link>
                    <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;" />
                </a>
            </div>
            <div class="content">
                <a id="ai-button" href="/pong-game" class="a-large-button" data-link>Play vs. AI</a>
                <div class="input-segment">
                    <div class="label">Play vs.</div>
                    <input id="opponent-name" class="text-field" type="text" placeholder="Guest" />
                    <a id="play-button" href="/pong-game" class="small-button-green" data-link>play</a>
                </div>
            </div>
        </div>
        `
    }

    attachEventListeners() {
        this.handlePlayButton = () => {
            let input = this.opponentInput.value;
            if (!input && !localStorage.getItem('username')) {
                sessionStorage.setItem('opponent_name', "");
            } else {
                sessionStorage.setItem('opponent_name', input || "Guest");
            }
        }
        
        this.handleAIButton = () => {
            sessionStorage.setItem('opponent_name', "AI");
        }

        this.playButton.addEventListener('click', this.handlePlayButton, {
            signal: this.controller.signal
        });
        this.aiButton.addEventListener('click', this.handleAIButton, {
            signal: this.controller.signal
        });

        this.handleOpponentName = () => {
            this.opponentInput.value = this.opponentInput.value.replace(/[^a-zA-Z0-9_-]/g, '');
        }
        this.opponentInput.addEventListener('input', this.handleOpponentName, {
            signal: this.controller.signal
        });
    }

    afterRender = async () => {
        this.playButton = document.getElementById('play-button');
        this.aiButton = document.getElementById('ai-button');
        this.opponentInput = document.getElementById('opponent-name');

        this.attachEventListeners();

        return () => {
            this.controller.abort();
        }
    }
}
