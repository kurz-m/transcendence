class TournamentGame {

}

export const startTournament = () => {
    if (currentPongGame) {
        currentPongGame.resetGame();
        currentPongGame = null;
    }
    currentTournament = new TournamentGame();
};
