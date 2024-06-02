import { getUsername } from "../authentication.js";
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
        `
    }

    getSingleScoreTemplate(user, userScore, opponent, opponentScore, date) {
        return `
        <div class="list-item">
            <div class="match-icon">S</div>
            <div class="match-date">${date}</div>
            <img class="trophy" src="./static/media/trophy-gold.svg" draggable="false" (dragstart)="false;">
            <div class="match-result">
                <div class="left-player">${user}</div>
                <div class="score">
                    <div class="left-score">${userScore}</div>
                    <div class="score-colon">:</div>
                    <div class="right-score">${opponentScore}</div>
                </div>
                <div class="right-player">${opponent}</div>
            </div>
        </div>
        `;

    }

    getTournamentScoreTemplate(place, amount, date) {
        return `
        <div class="list-item">
            <button class="match-button">T</button>
            <div class="match-date">${date}</div>
            <img class="trophy" src="./static/media/trophy-gold.svg" draggable="false" (dragstart)="false;">
            <div class="match-result">
                <div class="tournament-place">${place + '.'}</div>
                <div class="match-text">out of</div>
                <div class="tournament-players">${amount}</div>
                <div class="match-text"> players</div>
            </div>
        </div>
        `;
    }

    afterRender = async () => {
        this.matchListContainer = document.querySelector('.scroll-matches');
        this.matchListContainer.innerHTML = '';

        const matches = [
            {
                "opponent": "Team Alpha",
                "own_score": 12,
                "opponent_score": 8,
                "win": true,
                "game_type": "Capture the Flag",
                "game_id": 12345
            },
            {
                "opponent": "Team Bravo",
                "own_score": 3,
                "opponent_score": 5,
                "win": false,
                "game_type": "Team Deathmatch",
                "game_id": 54321
            },
            {
                "opponent": "Team Charlie",
                "own_score": 21,
                "opponent_score": 19,
                "win": true,
                "game_type": "King of the Hill",
                "game_id": 98765
            }
        ]

        if (matches.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.classList.add('list-item');
            emptyMessage.textContent = 'No matches';
            this.matchListContainer.appendChild(emptyMessage);
            return;
        }
        
        /* create virtual DOM for building it up and adding it at once to the visible DOM */
        const fragment = document.createDocumentFragment();

        matches.forEach(match => {
            const matchItem = document.createElement('div');
            matchItem.classList.add('list-item');
            matchItem.innerHTML = (match.game_type === 'single')
                ? this.getSingleScoreTemplate(getUsername(), match.own_score, match.opponent, match.opponent_score, match.game_id)
                : this.getTournamentScoreTemplate();

            fragment.appendChild(matchItem);
        });
    }
}