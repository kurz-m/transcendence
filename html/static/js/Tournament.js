import { getLoggedIn, getUsername } from "./authentication.js";
import { startPongGame } from "./PongGame.js";
import { getDefaultHeader } from "./shared.js";

const POST_GAME_ID = 'https://transcendence.myprojekt.tech/api-game/game'
const POST_SCORE_API = 'https://transcendence.myprojekt.tech/api-game/score'

const mockObject = {
    game_type: 'tournament'
};

const states = {
    ANNOUNCE_GAME: 'announce_game',
    WAIT_GAME: 'wait_game',
    PLAY_GAME: 'play_game',
    SHOW_SCORE: 'show_score',
    SHOW_FINAL_SCORE: 'show_final_score'
}

const TROPHY_IMAGES = {
    1: "./static/media/trophy-gold.svg",
    2: "./static/media/trophy-silver.svg",
    3: "./static/media/trophy-bronze.svg",
    4: "./static/media/loose.svg"
};

class TournamentGame {
    constructor() {
        /* declare elements for creating the event */
        this.tournamentWindow = document.getElementById('tournament-window');
        this.playerListContainer = document.querySelector('.scroll-people');
        this.playerListContainer.innerHTML = '';
        this.totalPlayersCount = 0;
        this.totalPlayersElement = document.getElementById('total-players');
        this.playersArray = [];
        this.matchupArray = [];
        this.mIndex = 0;

        /* elements for event listeners */
        this.inputPlayer = document.getElementById('player-input');
        this.addPlayerButton = document.getElementById('add-player');
        this.startTournamentButton = document.getElementById('start-tournament');

        this.gameObject = null;
        this.options = null;

        /* controller for removing the event listeners */
        this.controller = new AbortController();

        /* elements for the game */
        this.currentState = states.ANNOUNCE_GAME;
        this.announceWindow = document.getElementById('announce-window');
        this.hudWindow = document.getElementById('hud-window');
        this.announceWindow = document.getElementById('announce-window');
        this.scoreWindow = document.getElementById('score-window');
        this.finalScoreWindow = document.getElementById('final-score-window');
        this.announceLeft = document.getElementById('announce-left');
        this.announceRight = document.getElementById('announce-right');
        this.nextGameButton = document.getElementById('next-game-button');
        this.announcePlayButton = document.getElementById('announce-play-button');
        this.ball = document.querySelector('#ball');

        /* elements for the final score window */
        this.rankScroll = document.getElementById('rank-scroll');
        this.matchScroll = document.getElementById('match-scroll');
    }

    async run() {
        /* add own player to the list if someone is logged in */
        if (getLoggedIn()) {
            this.addPlayer(getUsername());
        }
        /* start the event listeners */
        this.attachEventListeners();
    }

    createNewTournamentId = async () => {
        const header = getDefaultHeader();
        const raw = JSON.stringify({
            "game_type": "tournament"
        });

        try {
            const response = await fetch(POST_GAME_ID, {
                method: 'POST',
                headers: header,
                body: raw
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating a tournament:', error);
            throw error;
        }
    }

    getPlayerTemplate(player) {
        return `
        <div class="field">${player}</div>
        <button class="clean-button">
            <img class="small-icon" src="./static/media/person-remove.svg" alt="Remove">
        </button>
        `;
    }

    addPlayer(playerName) {
        if (playerName) {
            const playerItem = document.createElement('div');
            playerItem.classList.add('list-item');
            playerItem.innerHTML = this.getPlayerTemplate(playerName);
            this.totalPlayersCount++;
            this.totalPlayersElement.textContent = `Total Players: ${this.totalPlayersCount}`;
            const playerObject = {
                name: playerName,
                score: 0
            };
            this.playersArray.push(playerObject);

            /* add event listener to the remove button */
            const deleteButton = playerItem.querySelector('.clean-button');
            const deleteHandler = (playerName) => {
                this.totalPlayersCount--;
                this.totalPlayersElement.textContent = `Total Players: ${this.totalPlayersCount}`;

                const index = this.playersArray.findIndex(player => player.name === playerName);
                if (index > -1) {
                    this.playersArray.splice(index, 1);
                }

                playerItem.remove();
            };
            deleteButton.addEventListener('click', deleteHandler.bind(null, playerName), { once: true });

            /* attach the new created player to the tournament */
            this.playerListContainer.appendChild(playerItem);
            this.inputPlayer.value = '';
        }
    }

    attachEventListeners() {
        this.handleAddPlayer = () => {
            this.addPlayer(this.inputPlayer.value.trim());
            this.inputPlayer.focus();
        }
        this.addPlayerButton.addEventListener('click', this.handleAddPlayer, {
            signal: this.controller.signal
        });

        this.handleAddPlayerOnEnter = e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addPlayer(this.inputPlayer.value.trim());
            }
        }
        this.inputPlayer.addEventListener('keydown', this.handleAddPlayerOnEnter, {
            signal: this.controller.signal
        });

        this.handleStartTournament();
    }

    handleStartTournament = () => {
        const startTournament = async () => {
            if (this.playersArray.length < 3) {
                alert('You need at least 3 people to play a tournament');
                return;
            }
            try {
                if (getLoggedIn()) {
                    this.gameObject = await this.createNewTournamentId();
                } else {
                    this.gameObject = mockObject;
                }
            } catch (error) {
                console.error('Error starting tournament:', error);
                return;
            }
            this.options = {
                game_type: this.gameObject.game_type,
                game_id: this.gameObject.id,
            }
            this.createTournamentSchedule();
            this.tournamentLoop();
        }

        this.startTournamentButton.addEventListener('click', startTournament);
    }

    tournamentLoop() {
        this.removeEventListeners();
        this.executeGameState();
    }

    removeEventListeners() {
        this.startTournamentButton.removeEventListener('click', startTournament);
        this.controller.abort();
    }

    createTournamentSchedule() {
        for (let i = 0; i < this.playersArray.length; i++) {
            for (let j = i + 1; j < this.playersArray.length; j++) {
                const playerOne = this.playersArray[i].name;
                const playerTwo = this.playersArray[j].name;
                let randomMatchup = true;
                if (playerOne === 'AI') {
                    randomMatchup = false;
                } else if (playerTwo !== 'AI') {
                    randomMatchup = Math.random() < 0.5;
                }

                this.matchupArray.push({
                    left: randomMatchup ? playerOne : playerTwo,
                    right: randomMatchup ? playerTwo : playerOne,
                    score: {
                        left: 0,
                        right: 0
                    },
                    date: null
                });
            }
        }
        this.currentMatch = this.matchupArray[this.mIndex];
    }

    /* functions for the state machine of the tournament */
    hasMoreMatches() {
        return this.mIndex < this.matchupArray.length - 1;
    }

    nextMatch() {
        this.mIndex++;
        this.currentMatch = this.matchupArray[this.mIndex];
    }

    transition(newState) {
        this.currentState = newState;
        this.executeGameState();
    }

    executeGameState() {
        switch (this.currentState) {
            case states.ANNOUNCE_GAME:
                this.announceGame();
                break;
            case states.WAIT_GAME:
                this.waitForGame();
                break;
            case states.PLAY_GAME:
                this.playGame();
                break;
            case states.SHOW_SCORE:
                this.showScore();
                break;
            case states.SHOW_FINAL_SCORE:
                this.showFinalScore();
                break;
            default:
                console.log('invalid state');
        }
    }

    announceGame() {
        this.tournamentWindow.classList.add('hidden');
        this.announceLeft.textContent = this.currentMatch.left;
        this.announceRight.textContent = this.currentMatch.right;
        this.announceWindow.classList.remove('hidden');
        this.transition(states.WAIT_GAME);
    }

    waitForGame() {
        this.handleAnnouncePlay = () => {
            this.ball.classList.remove('hidden');
            this.announceWindow.classList.add('hidden');
            this.hudWindow.classList.remove('hidden');
            this.transition(states.PLAY_GAME);
        };
        this.announcePlayButton.addEventListener('click', this.handleAnnouncePlay, {
            once: true
        });
    }

    async playGame() {
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
        this.currentMatch.date = formattedDate;

        this.options.player_one = this.currentMatch.left;
        this.options.player_two = this.currentMatch.right;

        try {
            this.currentMatch.score = await startPongGame(this.options);
            this.transition(states.SHOW_SCORE);
        } catch (error) {
            console.error('error:', error);
        }
    }

    showScore() {
        if (!this.hasMoreMatches()) {
            this.nextGameButton.textContent = "Show Final Score";
        }
        this.nextGameHandler = () => {
            this.scoreWindow.classList.add('hidden');
            if (this.hasMoreMatches()) {
                this.nextMatch();
                this.transition(states.ANNOUNCE_GAME);
            } else {
                this.transition(states.SHOW_FINAL_SCORE);
            }
        };
        this.nextGameButton.addEventListener('click', this.nextGameHandler, {
            once: true
        });
    }

    updateFinaleScore() {
        for (const match of this.matchupArray) {
            const leftPlayer = this.playersArray.find(p => p.name === match.left);
            const rightPlayer = this.playersArray.find(p => p.name === match.right);

            if (match.score.left > match.score.right) {
                leftPlayer.score++;
            } else {
                rightPlayer.score++;
            }
        }
    }

    rankScoring() {
        this.playersArray.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            /* find direct match */
            const directMatch = this.matchupArray.find(match => {
                return (match.left === a.name && match.right === b.name) ||
                       (match.left === b.name && match.right === a.name);
            })

            if (directMatch.left === a.name) {
                return directMatch.score.right - directMatch.score.left;
            } else if (directMatch.left === b.name) {
                return directMatch.score.left - directMatch.score.right;
            }

            return 0;
        })
    }

    postFinaleScore() {
        const header = getDefaultHeader();
        let raw = JSON.stringify({
            "rank": this.playersArray.indexOf(getUsername()) + 1,
            "number_of_players": this.playersArray.length,
            "game_id": this.options.game_id
        });

        fetch(POST_SCORE_API, {
            method: 'POST',
            headers: header,
            body: raw
        })
        .then(response => {
            console.log(response.text());
        })
        .catch(error => console.log('error', error));
    }

    getRankScrollTemplate(player, rank) {
        const image = TROPHY_IMAGES[rank + 1] ||
                        TROPHY_IMAGES[4];

        return `
        <img class="trophy" src="${image}" draggable="false" (dragstart)="false;" />
        <div class="tournament-place">${rank + 1}</div>
        <div class="field">${player}</div>
        `;
    }

    getMatchScrollTemplate(match) {
        return `
        <div class="match-date">${match.date}</div>
        <div class="match-result">
            <div class="left-player">${match.left}</div>
            <div class="score">
                <div class="left-score">${match.score.left.toString()}</div>
                <div class="score-colon">:</div>
                <div class="right-score">${match.score.right.toString()}</div>
            </div>
            <div class="right-player">${match.right}</div>
        </div>
        `;
    }

    createFinalScoreContent() {
        this.rankContainer = document.querySelector('.scroll-tournament-result');
        this.rankContainer.innerHTML = '';
        this.matchContainer = document.querySelector('#match-scroll');
        this.matchContainer.innerHTML = '';

        const rankFragment = document.createDocumentFragment();
        for (const [index, player] of this.playersArray.entries()) {
            const rankItem = document.createElement('div');
            rankItem.classList.add('list-item-left');
            rankItem.innerHTML = this.getRankScrollTemplate(player.name, index);
            rankFragment.appendChild(rankItem);
        }
        this.rankContainer.appendChild(rankFragment);

        const matchFragment = document.createDocumentFragment();
        for (const match of this.matchupArray) {
            const matchItem = document.createElement('div');
            matchItem.classList.add('list-item');
            matchItem.innerHTML = this.getMatchScrollTemplate(match);
            matchFragment.appendChild(matchItem);
        }
        this.matchContainer.appendChild(matchFragment);
    }

    showFinalScore() {
        this.updateFinaleScore();
        this.rankScoring();
        if (getLoggedIn()) {
            this.postFinaleScore();
        }
        this.finalScoreWindow.classList.remove('hidden');
        this.createFinalScoreContent();
        console.log('game is finished now');
    }
}

let currentTournament = null;

export const startTournament = () => {
    if (currentTournament) {
        currentTournament.removeEventListeners();
        currentTournament = null;
    }
    currentTournament = new TournamentGame();
    currentTournament.run();
};
