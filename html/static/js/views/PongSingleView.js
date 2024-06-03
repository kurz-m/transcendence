import { setOpponent } from "../pong.js";
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
                <img class="icon" src="./static/media/back.svg" alt="Back" draggable="false" (dragstart)="false;">
            </button>
            <div class="title">Single Game</div>
            <a href="/" class="icon-button" data-link>
                <img class="icon" src="./static/media/home.svg" alt="Main Menu" draggable="false" (dragstart)="false;">
            </a>
            </div>
            <div class="content">
            <a id="ai-button" href="/pong-game" class="a-large-button" data-link>Play vs. AI</a>
            <div class="label-field-button">
                <div class="label">Play vs.</div>
                <input id="opponent-name" class="text-field" type="text" placeholder="Guest">
                <a id="play-button" href="/pong-game" class="a-small-button" data-link>play</a>
            </div>
            </div>
        </div>
        `
    }

    afterRender = async () => {
        const playButton = document.getElementById('play-button');
        const aiButton = document.getElementById('ai-button');

        const handlePlayButton = () => {
            setOpponent(document.getElementById('opponent-name').value);
        }

        const handleAIButton = () => {
            setOpponent("AI");
        }

        playButton.addEventListener('click', handlePlayButton, {
            signal: this.controller.signal
        });
        aiButton.addEventListener('click', handleAIButton, {
            signal: this.controller.signal
        });

        return () => {
            this.controller.abort();
        }
    }
}
