import { setOpponent } from "../pong.js";
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
                <input id="opponent-name" class="text-field" type="text" placeholder="Guest">
                <a id="single-game-play" href="/pong-game" class="small-button" data-link>play</a>
            </div>
            </div>
        </div>
        `
    }

    afterRender = async () => {
        const opponentName = document.getElementById('opponent-name')

        const handleInput = (e) => {
            const name = e.target.value;
            setOpponent(name);
        }
        opponentName.addEventListener('input', handleInput);
        return () => {
            opponentName.removeEventListener('input', handleInput);
        }
    }
}