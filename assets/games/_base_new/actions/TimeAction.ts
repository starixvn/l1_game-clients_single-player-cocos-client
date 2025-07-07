import GameUtils from "../../../common/GameUtils";
import { numberPad } from "../../../common/helpers/NumberHelper";
import { GameState } from "../../_base/GameState";
import GameDataManager from "../models/GameDataManager";
import MiniGameBase from "../view-models/MiniGameBase";

export const startGameLoop = (game: MiniGameBase) => () => {
    const gameData = game.gameData;
    const gameLoop = () => {
        if (game.gameState === GameState.Disabled) {
            GameDataManager.getInstance().clearGameLoop(game.gameId);
        } else {
            gameData.durations.countdown();
        }
    };
    GameDataManager.getInstance().clearGameLoop(game.gameId);
    GameDataManager.getInstance().startGameLoop(game.gameId, gameLoop);
};

export const stopGameLoop = (game: MiniGameBase) => () => {
    GameDataManager.getInstance().clearGameLoop(game.gameId);
};

const hideMainTimeAndClearGame = (game: MiniGameBase) => {
    game.showMainTime(false);
    GameDataManager.getInstance().clearGameLoop(game.gameId);
};

export const updateTimeOut = (game: MiniGameBase) => () => {
    game.showMainTime(false);
    const isReceivedSettlement = game.gameData.settlement.settlement !== null;
    if (!isReceivedSettlement) {
        game.gameData.settlement.isWaitingSettlement = true;
        GameDataManager.getInstance().clearGameLoop(game.gameId);
    }
};

export const handleForceTimeOut = (game: any) => (settlement) => {
    game.gameData.durations.remaining = 0;
    hideMainTimeAndClearGame(game);
};

export const updateClockTime =
    (game: MiniGameBase) =>
    ({ globalRemaining }) => {
        game.showWaittingTime(false);
        game.showMainTime(true);
        game.setMainTimeLabel(numberPad(globalRemaining, 2));
        if (game.countDownProgressBar) {
            game.countDownProgressBar.updateLockingBetFrame();
            game.countDownProgressBar.updateProgress(globalRemaining);
        }
    };

export const updateLockBet =
    (game: MiniGameBase) =>
    ({ globalRemaining }) => {
        updateClockTime(game)({ globalRemaining });
        game.betItems.forEach((item: any) => item.resetHighlight());
        game.disableRebetButton();
    };

export const updatePlacingBet =
    (game: MiniGameBase) =>
    ({ globalRemaining }) => {
        updateClockTime(game)({ globalRemaining });
        if (game.countDownProgressBar) {
            game.setWaitingDotsVisibility(false, false);
            game.countDownProgressBar.updateBetFrame();
            game.countDownProgressBar.updateProgress(globalRemaining);
        }
        showCurrentRoundId(game)();
        game.updateRebetButtonStatus();
    };

export const updateWaiting =
    (game: MiniGameBase) =>
    ({ remaining, globalRemaining }) => {
        game.disableRebetButton();
        game.showMainTime(false);
        game.showProcessingWarning(false);
        game.showWaittingTime(true);
        game.setWaitingTimeLabel(numberPad(remaining - 1, 2));

        const condition =
            globalRemaining < game.config.fullTime - game.wholeResultTime &&
            game.countDownProgressBar &&
            !game.countDownProgressBar.isShowRevertCountDown;

        if (condition) {
            game.setWaitingDotsVisibility(false);
            const duration = globalRemaining - game.config.betTime;
            game.countDownProgressBar.revertCountDown(duration);
        }
    };

export const updateStartingRound = (game: MiniGameBase) => () => {
    showCurrentRoundId(game)();
    game.disableRebetButton();
};

export const showCurrentRoundId = (game: MiniGameBase) => () => {
    game.gameData.gotIngameData && game.gameData.changeRoundId(game.gameData.roundHistory.lastRoundId + 1);
};

export const showLastRoundId = (game: MiniGameBase) => () => {
    game.gameData.gotIngameData && game.gameData.changeRoundId(game.gameData.roundHistory.lastRoundId);
};

export const clearRoundData = (game: MiniGameBase) => () => {
    game.clearData();
};

export const showStartBetMessage =
    (game: MiniGameBase) =>
    ({ duration = 2 } = {}) => {
        game.scheduleOnce(() => {
            game.getPromptMessageComponent()?.showStartBetMessage();
            game.gameAudios.playSFXAudio(GameUtils.getAudioKeyForLanguage("start-betting"));
        }, duration);
    };

export const showStopBetMessage =
    (game: MiniGameBase) =>
    ({ duration = 0 } = {}) => {
        game.scheduleOnce(() => {
            game.getPromptMessageComponent()?.showStopBetMessage();
            game.gameAudios.playSFXAudio(GameUtils.getAudioKeyForLanguage("stop-betting"));
        }, duration);
    };
