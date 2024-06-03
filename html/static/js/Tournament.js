import { startPongGame } from "./PongGame.js";
import { getDefaultHeader } from "./shared.js";

const POST_GAME_ID = 'https://transcendence.myprojekt.tech/api-game/game'
const POST_SCORE_API = 'https://transcendence.myprojekt.tech/api-game/score'

const mockObject = {
    game_type: 'tournament',
    game_id: 4
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

        /* elements for event listeners */
        this.inputPlayer = document.getElementById('player-input');
        this.addPlayerButton = document.getElementById('add-player');
        this.startTournamentButton = document.getElementById('start-tournament');

        this.gameObject = null;
        this.options = null;

        /* controller for removing the event listeners */
        this.controller = new AbortController();
    }
    
    async run() {
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
    
    attachEventListeners() {
        this.handleAddPlayer = () => {
            const playerName = this.inputPlayer.value.trim();
            
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
        this.addPlayerButton.addEventListener('click', this.handleAddPlayer, {
             signal: this.controller.signal
        });

        this.handleAddPlayerOnEnter = e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleAddPlayer();
            }
        }
        this.inputPlayer.addEventListener('keydown', this.handleAddPlayerOnEnter, {
            signal: this.controller.signal
        });

        this.handleStartTournament();
    }

    handleStartTournament = () => {
        const startTournament = async () => {
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

        this.startTournamentButton.addEventListener('click', startTournament, {
            once: true
        });
    }

    tournamentLoop() {
        this.removeEventListeners();
        const playSingleMatch = async () => {
            for (const match of this.matchupArray) {
                this.options.player_one = match.left;
                this.options.player_two = match.right;

                try {
                    match.score = await startPongGame(this.options);
                } catch (error) {
                    
                }
            }

        }
    }

    removeEventListeners() {
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
