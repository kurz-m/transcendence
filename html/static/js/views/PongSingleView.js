import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Single Game");
        this.controller = new AbortController();
        document.getElementById('login-button').classList.add('hidden');
    }

    getHtml = async () => {
        return `
        <div id="single-window" class="window">
            <div class="topbar">
                <button id="back-button" onclick="history.back()" class="icon-button">
                    <i class="bi bi-caret-left-fill"></i>
                </button>
                <div class="title">Single Game</div>
                <a href="/" class="icon-button" (dragstart)="false;" draggable="false" data-link>
                    <i class="bi bi-house-fill"></i>
                </a>
            </div>
            <div class="content">
                <button id="ai-button" class="a-large-button">Play vs. AI</button>
                <div class="input-segment">
                    <div class="label">Play vs.</div>
                    <input id="opponent-name" class="text-field" type="text" placeholder="Guest" />
                    <button id="to-announce-window" class="small-button-green">Play</button>
                </div>
            </div>
        </div>

        <div id="announce-window" class="window hidden">
            <div class="title">Next Game</div>
            <div class="content">
                <div class="h-content">
                    <div class="announce-player">
                        <div id="announce-left" class="subheading">Player 1</div>
                        <div class="controls">
                            <div class="small-text">Controls:&nbsp</div>
                            <div class="small-text-bold">WS</div>
                        </div>
                    </div>
                    <div class="announce-vs">
                        <div class="subheading">vs.</div>
                    </div>
                    <div class="announce-player">
                        <div id="announce-right" class="subheading">Player 2</div>
                        <div id="right-control" class="controls">
                            <div class="small-text">Controls:&nbsp</div>
                            <div class="small-text-bold">↑↓</div>
                        </div>
                    </div>
                </div>
                <a id="play-button" href="/pong-game" class="large-button-green" data-link>Play</a>
            </div>
        </div>
        `
    }

    announceGame() {

    }

    attachEventListeners() {
        this.handleToAnnounceButton = () => {
            if (this.opponentInput.value.length === 0) {
                return;
            }
            // let input = this.opponentInput.value;
            // if (!input && !localStorage.getItem('username')) {
            //     sessionStorage.setItem('opponent_name', "");
            // } else {
            //     sessionStorage.setItem('opponent_name', input || "Guest");
            // }
            if (!localStorage.getItem('username')) {
                this.announceLeft.innerHTML = 'Me';
            } else {
                this.announceLeft.innerHTML = localStorage.getItem('username');
            }
            this.announceRight.innerHTML = this.opponentInput.value;
            sessionStorage.setItem('opponent_name', this.opponentInput.value);
            this.singleWindow.classList.add('hidden');
            this.announceWindow.classList.remove('hidden');
        }
        
        this.handleAIButton = () => {
            this.rightControl.classList.add('hidden');
            this.opponentInput.value = 'AI';
            this.handleToAnnounceButton();
        }

        this.toAnnounceWindowButton.addEventListener('click', this.handleToAnnounceButton, {
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

        this.handleStartGame = () => {
            navigateTo('/pong-game');
        }

        this.startGameButton.addEventListener('click', this.handleStartGame, {
            signal: this.controller.signal
        });
    }

    afterRender = async () => {
        this.singleWindow = document.getElementById('single-window');
        this.announceWindow = document.getElementById('announce-window');
        this.toAnnounceWindowButton = document.getElementById('to-announce-window');
        this.announceLeft = document.getElementById('announce-left');
        this.announceRight = document.getElementById('announce-right');
        this.aiButton = document.getElementById('ai-button');
        this.opponentInput = document.getElementById('opponent-name');
        this.startGameButton = document.getElementById('play-button');
        this.rightControl = document.getElementById('right-control');

        this.attachEventListeners();

        return () => {
            this.controller.abort();
        }
    }
}
