import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import NoticeUtil from "../../../common/utils/NoticeUtil";
import { appManager } from "../../../managers/AppManager";
import { GameState } from "../../_base/GameState";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import MiniGameBase from "../view-models/MiniGameBase";
import NewTicketDetailBase from "../view-models/NewTicketDetailBase";
import { showCurrentRoundId, showLastRoundId } from "./TimeAction";

export const onUM = (game: MiniGameBase) => (data) => {
    if (game.gameState === GameState.Disabled) {
        return;
    }
    const joinGameInUM = !!data.remainingTime;
    if (!joinGameInUM) {
        game.gameData.durations.resetTimeForUM();
    }

    if (joinGameInUM || game.checkShowUmMessage(data)) {
        game.showUmMessage(data);
        game.disableGame();
    }
};

export const checkToOffUM = (game: any) => (data) => {
    if (game.checkHideUmMessage(data)) {
        game.gameData.umModel.clearUM();
        game.hideUmMessage();
        game.startGame();
    }
};

export const handleNotice = (game: any) => (notice) => {
    const { errorCode, hedgeBetGroup, minBet, maxBet, gameRoundId, gameTypeId } = notice;
    const gameName = GameUtils.getGameNameString(gameTypeId);

    if (!gameRoundId || gameRoundId === game.roundId) {
        const opt = { gameName, gameRoundId, errorCode, minBet: numberWithCommas(minBet), maxBet: numberWithCommas(maxBet) };

        if (hedgeBetGroup && hedgeBetGroup.length > 0) {
            hedgeBetGroup.forEach((choice, index) => {
                opt[`betChoice${index + 1}`] = game.getBetChoiceString(choice);
            });
        }

        const text = NoticeUtil.getLocalizedErrorMessage(errorCode, opt);
        if (text) {
            game.showMiniWarning(text);
        }
    }
};

export const handleGameConfigs = (game: any) => (gameConfigs) => game.setGameConfigs(gameConfigs);

export const handleBoostedOdds = (game: MiniGameBase) => (boostedOdds) => game.applyPromotion(boostedOdds);

export const handleBoostedChoices = (game: MiniGameBase) => (boostedChoices) => game.setBoostedChoices(boostedChoices);

export const handleFirstLoadRoundHistory = (game: MiniGameBase) => (roundHistory) => {
    const isShowingSettlement =
        game.gameData.settlement.isShowingSettlement || game.gameData.durations.isBeingSpecificPhase(Durations.Events.SHOW_ANIMATION);
    if (game.gameData.durations.isWaiting() || isShowingSettlement) {
        if (roundHistory.length > 0) {
            const settlement = roundHistory[0];
            if (settlement && !game.gameData.settlement.isWaitingSettlement && !game.isShowingSettlementOnUI) {
                game.gameData.settlement.finishShowResult(settlement, false);
            }
        }

        showLastRoundId(game)();
    }
    if (
        game.gameData.durations.isPlacingBet() ||
        game.gameData.durations.isLocking() ||
        game.gameData.durations.isBeingSpecificPhase(Durations.Events.STARTING_ROUND)
    ) {
        showCurrentRoundId(game)();
    }
};
export const handleRoundHistory = (game: any) => (roundHistory) => {
    game.currentDataLogs = roundHistory;
    game.handleRoundHistory(roundHistory);
};

export const handleWinningStreak = (game: any) => (roundHistory) => {
    game.callbackWinningStreak(game, roundHistory);
};

export const changeGameRound = (game: any) => (roundId) => {
    game.roundId = roundId;
    game.setGameRound(roundId);
    game.updateRebetButtonStatus();
};
export const updateMD5String = (game: any) => (data) => {
    game.md5Component && game.md5Component.updateMD5Data(data);
};

export const showHashAtPlacingBet = (game: any) => () => {
    game.gameData.resultHash.updateUI();
};

export const handleShowStatus = (game: any) => (status) => {
    game.callbackWinningResult(game, status);
    game.showStatus(status);
    game.gameData.settlement.clearStatus();
};

export const handleShowResult = (game: MiniGameBase) => (settlement) => {
    if (game.isDisableGame) {
        return;
    }
    game.inSettlementSequence = true;
    if (game.usingNewSettlement) {
        game.gameData.settlement.clearStatus();
        game.gameData.settlement.clearWinnersData();
    }
    game.gameData.roundHistory.add(settlement);
    game.gameData.roundHistory.checkWinningStreak(settlement, game.showResultDuration);
    game.disableRebetButton();
    if (game.countDownProgressBar) {
        game.animatedTime.node.active = false;
        game.setWaitingDotsVisibility(true);
        game.countDownProgressBar.setIndicatorVisibility(false);
    }

    const isDelayEndGame = game.gameData.durations.isBeforePlacingBet();
    if (isDelayEndGame || !appManager.GAME_IS_SHOWED) {
        game.gameData.settlement.finishShowResult(settlement, false);
    } else {
        game.isShowingSettlementOnUI = true;
        game.showSettlementResult(settlement);
    }
};

export const handleAfterSettlementResult =
    (game: MiniGameBase) =>
    ({ settlement, animated }) => {
        game.isShowingSettlementOnUI = false;
        if (game.isDisableGame) {
            return;
        }
        game.disableRebetButton();
        game.handleAfterSettlementResult(settlement, animated);
    };

export const showBetDetailsUrl = (game: MiniGameBase) => (data) => {
    if (!game.ticketDetailPrefab) {
        return;
    }
    const dialog = cc.instantiate(game.ticketDetailPrefab);
    game.currentMiniPanel.addDialog(dialog);
    const ticketDetailComponent = dialog.getComponent(NewTicketDetailBase);
    ticketDetailComponent.setURL(data);
    ticketDetailComponent.loadWebView();
};
