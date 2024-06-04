import { getLoggedIn, getUsername } from "./authentication.js";
import { startPongGame } from "./PongGame.js";
import { getDefaultHeader } from "./shared.js";

const POST_GAME_ID = 'https://transcendence.myprojekt.tech/api-game/game'
const POST_SCORE_API = 'https://transcendence.myprojekt.tech/api-game/score'

const mockObject = {
    game_type: 'tournament',
    game_id: 4
};

const states = {
    ANNOUNCE_GAME: 'announce_game',
    WAIT_GAME: 'wait_game',
    PLAY_GAME: 'play_game',
    SHOW_SCORE: 'show_score',
    SHOW_FINAL_SCORE: 'show_final_score'
}

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
            this.playersArray.push(playerName);
    
            /* add event listener to the remove button */
            const deleteButton = playerItem.querySelector('.clean-button');
            const deleteHandler = (playerName) => {
                this.totalPlayersCount--;
                this.totalPlayersElement.textContent = `Total Players: ${this.totalPlayersCount}`;
    
                const index = this.playersArray.indexOf(playerName);
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
                return;
            }
            try {
                // this.gameObject = await this.createNewTournamentId();
                this.gameObject = mockObject;
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
                const playerOne = this.playersArray[i];
                const playerTwo = this.playersArray[j];
                const randomMatchup = Math.random() < 0.5;

                this.matchupArray.push({
                    left: randomMatchup ? playerOne : playerTwo,
                    right: randomMatchup ? playerTwo : playerOne,
                    score: {
                        left: 0,
                        right: 0
                    }
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

    showFinalScore() {
        this.finalScoreWindow.classList.remove('hidden');        
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
