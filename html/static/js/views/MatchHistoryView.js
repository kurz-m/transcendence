import { getUsername } from "../authentication.js";
import AbstractView from "./AbstractView.js";

const TROPHY_IMAGES = {
    1: "./static/media/trophy-gold.svg",
    2: "./static/media/trophy-silver.svg",
    3: "./static/media/trophy-bronze.svg",
    4: "./static/media/loose.svg"
};

const mockMatches = {
    "games": [
        {
            "opponent": "Florian",
            "own_score": 12,
            "opponent_score": 8,
            "win": true,
            "game_type": "single",
            "game_id": 12345,
            "rank": null,
            "number_of_players": null
        },
        {
            "opponent": "Team Bravo",
            "own_score": 3,
            "opponent_score": 5,
            "win": false,
            "game_type": "tournament",
            "game_id": 54321,
            "rank": 2,
            "number_of_players": 5
        },
        {
            "opponent": "noone",
            "own_score": 5,
            "opponent_score": 11,
            "win": false,
            "game_type": "single",
            "game_id": 98765,
            "rank": null,
            "number_of_players": null
        }
    ]
};

const mockResponse = JSON.stringify(mockMatches);

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
                        <div class="tournament-rank">1st</div>
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
        const image = (userScore > opponentScore)
            ? TROPHY_IMAGES[1]
            : TROPHY_IMAGES[4];

        return `
        <div class="list-item">
            <div class="match-icon">S</div>
            <div class="match-date">${date}</div>
            <img class="trophy" src="${image}" draggable="false" (dragstart)="false;">
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

    getTournamentScoreTemplate(rank, number_of_players, date) {
        const image = TROPHY_IMAGES[rank] || TROPHY_IMAGES[4];

        return `
        <div class="list-item">
            <button class="match-button">T</button>
            <div class="match-date">${date}</div>
            <img class="trophy" src="${image}" draggable="false" (dragstart)="false;">
            <div class="match-result">
                <div class="tournament-rank">${rank + '.'}</div>
                <div class="match-text">out of</div>
                <div class="tournament-players">${number_of_players}</div>
                <div class="match-text"> players</div>
            </div>
        </div>
        `;
    }

    async getMatches() {
        try {
            /* placeholder for the fetch call */
            const response = JSON.parse(mockResponse);

            if (response) {
                return response.games;
            }
        } catch (error) {
            console.error('error fetching games:', error);
        }
    }

    afterRender = async () => {
        this.matchListContainer = document.querySelector('.scroll-matches');
        this.matchListContainer.innerHTML = '';

        try {
            const matches = await this.getMatches();

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
                    : this.getTournamentScoreTemplate(match.rank, match.number_of_players, match.game_id);

                fragment.appendChild(matchItem);
            });

            this.matchListContainer.appendChild(fragment);

        } catch (error) {
            console.error('error fetching games:', error);
        }

    }
}
