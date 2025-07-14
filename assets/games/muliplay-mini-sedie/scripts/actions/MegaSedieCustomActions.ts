import MiniSedie from "../MiniSedie";

export const handlePlacingBet = (game: MiniSedie) => () => {
    game.highlightLastResult();
    game.closePlate(false);
};

export const handleShakeDish = (game: MiniSedie) => () => {
    game.gameAudios && game.gameAudios.playStartGameAudio();
    game.resetDataAndUI();
    game.highlightLastResult();
    game.shakeThePlate();
};
