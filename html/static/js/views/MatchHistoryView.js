import { getUsername } from "../authentication.js";
import { getDefaultHeader, getUserCache } from "../shared.js";
import AbstractView from "./AbstractView.js";

const TROPHY_IMAGES = {
    1: ['bi-trophy-fill', 'gold-trophy'],
    2: ['bi-trophy-fill', 'silver-trophy'],
    3: ['bi-trophy-fill', 'bronze-trophy'],
    4: ['bi-emoji-tear-fill', 'emoji-tears']
};

const GET_SCORE_API = 'https://transcendence.myprojekt.tech/api-game/user_games';

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
        this.loader = document.querySelector('.loader');
        this.loader.classList.remove('loader-hidden');
    }

    getHtml = async () => {
    return `
    <div id="wrapper" class="window hidden">
        <div class="topbar">
            <button id="back-button" onclick="history.back()" class="icon-button">
                <i class="bi bi-caret-left-fill"></i>
            </button>
            <div class="title">Match History</div>
            <a href="/" class="icon-button" (dragstart)="false;" draggable="false" data-link>
                <i class="bi bi-house-fill"></i>
            </a>
        </div>
        <div class="content">
            <div class="match-list">
                <div class="scroll-matches"></div>
            </div>
        </div>
    </div>
        `
    }

    getSingleScoreTemplate(match) {
        const icon = (match.own_score > match.opponent_score)
            ? TROPHY_IMAGES[1]
            : TROPHY_IMAGES[4];

        return `
        <div class="list-item">
            <div class="match-icon">S</div>
            <div class="match-date">${match.created_date}</div>
            <i class="bi ${icon.join(' ')} trophy"></i>
            <div class="match-result">
                <div class="left-player">${this.cache.data.user.username}</div>
                <div class="score">
                    <div class="left-score">${match.own_score}</div>
                    <div class="score-colon">:</div>
                    <div class="right-score">${match.opponent_score}</div>
                </div>
                <div class="right-player">${match.opponent}</div>
            </div>
        </div>
        `;

    }

    getTournamentScoreTemplate(match) {
        const icon = TROPHY_IMAGES[match.rank] || TROPHY_IMAGES[4];

        return `
        <div class="list-item">
            <button class="match-button">T</button>
            <div class="match-date">${match.created_date}</div>
            <i class="bi ${icon.join(' ')} trophy"></i>
            <div class="match-result">
                <div class="tournament-rank">${match.rank}.&nbsp</div>
                <div class="match-text">out of</div>
                <div class="tournament-players">${match.number_of_players}</div>
                <div class="match-text"> players</div>
            </div>
        </div>
        `;
    }

    async getMatches(playerId) {
        try {
            const response = await fetch(`${GET_SCORE_API}/${playerId}`, {
                method: 'GET',
                headers: getDefaultHeader()
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('error fetching games:', error);
        }
    }

    afterRender = async () => {
        setTimeout(() => {
            this.loader.classList.add('loader-hidden');
        }, 250);
        setTimeout(() => {
            this.wrapper.classList.remove('hidden');
        }, 250);
        this.cache = await getUserCache();
        this.wrapper = document.getElementById('wrapper');
        this.matchListContainer = document.querySelector('.scroll-matches');
        this.matchListContainer.innerHTML = '';
        if (!this.cache) {
            /* TODO: add some error handling */
        }
        try {
            const matches = await this.getMatches(this.cache.data.user.id);

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
                    ? this.getSingleScoreTemplate(match)
                    : this.getTournamentScoreTemplate(match);

                fragment.appendChild(matchItem);
            });

            this.matchListContainer.appendChild(fragment);

        } catch (error) {
            console.error('error fetching games:', error);
        }

    }
}
