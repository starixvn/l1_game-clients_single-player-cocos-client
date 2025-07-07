import AudioManager from "../../../common/audio/AudioManager";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { HiloChoicesConst } from "../events-models/HiLoChoices";
import { HiLoOwnBetsModel } from "../events-models/HiLoOwnBetsModel";
import { HiLoStatusModel } from "../events-models/HiLoStatusModel";
import HiLo from "../view-models/HiLo";

export const handleStatusWon = (mainGame: HiLo) => async (statusModel: HiLoStatusModel) => {
    AudioManager.getInstance().playSFX(mainGame.collectAudioClip);
    mainGame.updateUserBalance();
    mainGame.resetUIPrepareNewRound();
    await mainGame.showWinningBet(statusModel.bet);
    mainGame.gameData.stateModel.prepareNewRound();
};

export const handleStatusLost = (mainGame: HiLo) => async (statusModel: HiLoStatusModel) => {
    if (statusModel.isSettled && !statusModel.win && mainGame.shouldHandleStatus) {
        mainGame.shouldHandleStatus = false;
        mainGame.resetUIPrepareNewRound();
        await mainGame.showUserLoseMessage();
        mainGame.gameData.stateModel.prepareNewRound();
        statusModel.reset();
    }
};

export const updateCard = (mainGame: HiLo) => async (model: HiLoOwnBetsModel) => {
    mainGame.resultComp.updateResult(model.result);
    await mainGame.resultComp.spin(mainGame.spinCardsEffectDuration, model.remainingTime > mainGame.config.betTime);
};

export const updateStatistic = (mainGame: HiLo) => (model: HiLoOwnBetsModel) => {
    mainGame.statisticComp.updateCards(model.result);
};

export const updateStakesAndButtons = (mainGame: HiLo) => (model: HiLoOwnBetsModel) => {
    const highestRank = "A";
    const lowestRank = "2";
    const currentResult = model.result[model.result.length - 1];

    mainGame.bettingAreas.forEach((area) => {
        let isSpecialCase = false;
        if (
            (currentResult.rank === highestRank && area.betChoice === HiloChoicesConst.higher) ||
            (currentResult.rank === lowestRank && area.betChoice === HiloChoicesConst.lower)
        ) {
            area.resetStakeAmount();
            isSpecialCase = true;
        }
        area.enableBetChoice(!isSpecialCase);
        if (!isSpecialCase && model.nextAmounts) {
            area.updateStakeAmount(model.nextAmounts[area.betChoice]);
        }
    });
    mainGame.betWin.string = numberWithCommas(model.betwin, 2);
    mainGame.enableCollectButton(model.totalTurns > 0);
};
