import UnbalancedBigSmall from "../UnbalancedBigSmall";

export const handlePlacingBet = (game: UnbalancedBigSmall) => () => {
    game.setBgTimerVisibility(true, false);
    game.highlightLastResult();
    game.resetThePlate();
    game.disableResultNode();
};

export const handleBeginPlacingBet = (game: UnbalancedBigSmall) => () => {
    game.setBgTimerVisibility(true);
};

export const handleShakeDish = (game: UnbalancedBigSmall) => () => {
    game.resetDataAndUI();
    game.highlightLastResult();
    game.shakeThePlate();
};
