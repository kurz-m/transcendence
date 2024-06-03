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

        /* start the event listeners */
        this.attachEventListeners();
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
        /* elements for adding players to the tournament */
        /* TODO: add player input to an array of players */
        this.inputPlayer = document.getElementById('player-input');
        this.addPlayerButton = document.getElementById('add-player');

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

                this.matchupArray.length = 0;
                this.createTournamentSchedule();
                this.testMatches();
            }
        }
        this.addPlayerButton.addEventListener('click', this.handleAddPlayer);

        this.handleAddPlayerOnEnter = e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleAddPlayer();
            }
        }
        this.inputPlayer.addEventListener('keydown', this.handleAddPlayerOnEnter);

        /* element for starting the tournament */
        this.startTournamentButton = document.getElementById('start-tournament');

        this.handleStartTournament = () => {

        }
    }

    removeEventListeners() {
        this.addPlayerButton.removeEventListener('click', this.handleAddPlayer);
        this.inputPlayer.removeEventListener('keydown', this.handleAddPlayerOnEnter);
    }

    createTournamentSchedule() {
        for (let i = 0; i < this.playersArray.length; i++) {
            for (let j = i + 1; j < this.playersArray.length; j++) {
                const playerOne = this.playersArray[i];
                const playerTwo = this.playersArray[j];
                const randomMatchup = Math.random() < 0.5;

                this.matchupArray.push({
                    left: randomMatchup ? playerOne : playerTwo,
                    right: randomMatchup ? playerTwo : playerOne
                });
            }
        }
    }

    testMatches() {
        for (const match of this.matchupArray) {
            console.log(match.left, "vs.", match.right);
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
};
