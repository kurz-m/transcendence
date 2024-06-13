import { getDefaultHeader, getUserCache, toastErrorMessage } from "../shared.js";
import AbstractView from "./AbstractView.js";

const TROPHY_IMAGES = {
    1: ['bi-trophy-fill', 'gold-trophy'],
    2: ['bi-trophy-fill', 'silver-trophy'],
    3: ['bi-trophy-fill', 'bronze-trophy'],
    4: ['bi-emoji-tear-fill', 'emoji-tears']
};

const GET_SCORE_API = 'https://transcendence.myprojekt.tech/api-game/user_games';

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Dashboard");
        this.loader = document.querySelector('.loader');
        this.loader.classList.remove('loader-hidden');
        this.wins = 0;
        this.losses = 0;
    }

    getHtml = async () => {
    return `
    <div id="wrapper" class="window make-opaque">
        <div class="topbar">
            <button id="back-button" onclick="history.back()" class="icon-button">
                <i class="bi bi-caret-left-fill"></i>
            </button>
            <div class="title">My Dashboard</div>
            <a href="/" class="icon-button" (dragstart)="false;" draggable="false" data-link>
                <i class="bi bi-house-fill"></i>
            </a>
        </div>
        <div class="content">
            <div class="my-stats">
                <i class="bi bi-trophy-fill gold-trophy stats-trophy"></i>
                <div id="wins" class="medium-text">0</div>
                <div class="progress-bar">
                    <div id="win-percentage" class="progress"></div>
                </div>
                <div id="losses" class="medium-text">0</div>
                <i class="bi bi-emoji-tear-fill emoji-tears stats-trophy"></i>
            </div>
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
        if (navigator.onLine) {
            try {
                const response = await fetch(`${GET_SCORE_API}/${playerId}`, {
                    method: 'GET',
                    headers: getDefaultHeader(),
                    signal: AbortSignal.timeout(5000)
                });
    
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                toastErrorMessage('Could not fetch match history');
                console.error('error fetching games:', error);
                return [];
            }
        } else {
            toastErrorMessage('Could not fetch match history');
            return [];
        }
    }

    afterRender = async () => {
        setTimeout(() => {
            this.loader.classList.add('loader-hidden');
        }, 250);
        setTimeout(() => {
            this.wrapper.classList.remove('make-opaque');
        }, 250);
        this.cache = await getUserCache();
        this.wrapper = document.getElementById('wrapper');
        this.matchListContainer = document.querySelector('.scroll-matches');
        this.winRateBar = document.getElementById('win-percentage');
        this.winsElement = document.getElementById('wins');
        this.lossesElement = document.getElementById('losses');
        this.matchListContainer.innerHTML = '';
        if (!this.cache) {
            toastErrorMessage('Could not get user cache');
            return;
        }
        try {
            const matches = await this.getMatches(this.cache.data.user.id);

            if (matches.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.classList.add('list-item');
                emptyMessage.textContent = 'No items';
                this.matchListContainer.appendChild(emptyMessage);
                return;
            }

            /* create virtual DOM for building it up and adding it at once to the visible DOM */
            const fragment = document.createDocumentFragment();
            this.totalMatches = matches.length;
            matches.forEach(match => {
                if (match.win) {
                    this.wins++;
                } else {
                    this.losses++;
                }
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
        const winRate = this.wins / this.totalMatches * 100;
        this.winRateBar.style.width = winRate + '%';
        this.winsElement.innerHTML = this.wins;
        this.lossesElement.innerHTML = this.losses;
    }
}
