import GameBase from "../../_base/GameBase";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import MiniGameBase from "../view-models/MiniGameBase";
import { collectChipsLost, dealerGetChipsMiniGame } from "./../../_base/action/PayChipsAction";

export const updateTotalBets = (gameBase: MiniGameBase) => (data) => {
    if (gameBase.isDisableGame) {
        return;
    }
    const isStartingRound = gameBase.gameData.durations.isBeingSpecificPhase(Durations.Events.STARTING_ROUND);
    const totalBetsData = isStartingRound ? {} : data;
    gameBase.betItems.forEach((item) => item.setTotalBetsData(totalBetsData));
};

export const updateOwnBets = (gameBase: MiniGameBase) => (data) => {
    if (gameBase.isDisableGame || gameBase.isStartingRound()) {
        return;
    }
    gameBase.betItems.forEach((item) => item.setOwnBetsData(data));
};

export const updatePreviousBets = (gameBase: GameBase) => (data) => {
    if (Object.keys(data).length > 0) {
        gameBase.previousOwnBets = {
            roundId: gameBase.truthyRoundId,
            ownBets: data
        };
        gameBase.updateRebetButtonStatus();
        gameBase.saveRebetStorage(gameBase.previousOwnBets);
    }
};

export const placeBetFailed = (gameBase: MiniGameBase) => () => {
    gameBase.showProcessingWarning(false);
};

export const placeBetSuccess = (gameBase: MiniGameBase) => (endBet: number) => {
    gameBase.showProcessingWarning(false);
    gameBase.showAcceptedBet(endBet);
};

export const placeOwnChipsFake = (gameBase: MiniGameBase) => (ownBets) => {
    if (!gameBase.isPlacingFakeChip || gameBase.isDisableGame || gameBase.isStartingRound()) {
        return;
    }
    gameBase.betItems.forEach((item) => {
        const choice = item.node.name;
        const betValue = ownBets[choice];
        gameBase.betChips.showChipOwnBet(item, betValue);
    });
};

export const changeBetPercentage = (game: MiniGameBase) => (betPercentage: any) => {
    if (game.isDisableGame) {
        return;
    }
    const isStartingRound = game.gameData.durations.isBeingSpecificPhase(Durations.Events.STARTING_ROUND);
    Object.keys(betPercentage).forEach((key) => {
        const label = game.betPercentage.find((label) => label.node.name === key);

        if (label) {
            label.string = isStartingRound ? `0%` : `${betPercentage[key]}%`;
        }
    });
};

export const handleFlyOwnChipFake = (game: MiniGameBase) => (data) => {
    if (!game.isPlacingFakeChip) {
        return;
    }
    if (data.endBet) {
        const betItem = game.betItems.find((item) => item.node.name.toLowerCase() === data.betChoice.toLowerCase());
        game.betChips.placeChipToChipBox(data.endBet, betItem.chipNode, null, null);
    }
};

export const handlePayChips = (gameBase: MiniGameBase) => (finishData) => {
    if (!gameBase.isPlacingFakeChip) {
        return;
    }
    const { settlement, animated } = finishData;
    if (!animated) {
        return;
    }

    gameBase.isCollectChip
        ? dealerGetChipsMiniGame(
              gameBase,
              settlement.settlementResult,
              gameBase.gameData.settlement.status,
              gameBase.gameData.betModel.ownBets
          )
        : collectChipsLost(gameBase, settlement.settlementResult);
};
