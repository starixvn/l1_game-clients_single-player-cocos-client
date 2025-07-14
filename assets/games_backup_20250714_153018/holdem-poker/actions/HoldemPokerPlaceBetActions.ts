import BetChipsNew from "../../../common/bet-chips/view-models/BetChipsNew";
import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { HoldemPokerChoicesConst } from "../event-models/HoldemPokerChoices";
import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";
import { HoldemPokerPlaceBetModel } from "../event-models/HoldemPokerPlaceBetModel";
import { HoldemPokerState } from "../event-models/HoldemPokerState";
import { HoldemPokerStateModel } from "../event-models/HoldemPokerStateModel";
import HoldemPoker from "../view-models/HoldemPoker";
import HoldemPokerBettingArea from "../view-models/HoldemPokerBettingArea";
import HoldemPokerChips from "../view-models/HoldemPokerChips";
import { CasinoChoices } from "./../event-models/HoldemPokerChoices";

export const showHideButtons = (main: HoldemPoker) => (stateModel: HoldemPokerStateModel) => {
    switch (stateModel.state) {
        case HoldemPokerState.ante_bet:
        case HoldemPokerState.all_bet:
            main.dealButton.active = main.cancelButton.active = main.doubleButton.active = true;
            main.reBetAndDealButton.active = main.newButton.active = false;
            main.disabledButtons(false);
            break;
        case HoldemPokerState.aa_bet:
            main.cancelButton.active = true;
            main.doubleButton.active = main.newButton.active = main.dealButton.active = false;
            main.reBetAndDealButton.active = false;
            break;
        case HoldemPokerState.blank_new:
            main.dealButton.active = main.cancelButton.active = main.doubleButton.active = false;
            main.reBetAndDealButton.active = main.newButton.active = false;
            main.disabledButtons(false);
            break;
        case HoldemPokerState.prepare_new:
            main.reBetAndDealButton.active = main.newButton.active = true;
            main.doubleAndCallButton.active = main.foldButton.active = false;
            main.dealButton.active = main.doubleButton.active = main.cancelButton.active = false;
            main.disabledButtons(false);
            break;
        case HoldemPokerState.replay_new:
            main.doubleAndCallButton.active = main.foldButton.active = false;
            main.dealButton.active =
                main.doubleButton.active =
                main.cancelButton.active =
                main.reBetAndDealButton.active =
                main.newButton.active =
                    false;
            break;
        case HoldemPokerState.calling_deal:
            main.disabledButtons(true);
            break;
        case HoldemPokerState.dealing:
            main.disabledButtons(false);
            main.dealButton.active = main.doubleButton.active = main.cancelButton.active = false;
            main.reBetAndDealButton.active = main.newButton.active = false;
            break;
        case HoldemPokerState.dealt:
            main.trackSwapButtonShow();
            main.swapButton.active = main.holdButton.active = true;
            break;
        case HoldemPokerState.calling_call:
        case HoldemPokerState.calling_fold:
        case HoldemPokerState.settled:
            main.doubleAndCallButton.active = main.foldButton.active = false;
            main.swapButton.active = main.holdButton.active = false;
            break;
        case HoldemPokerState.swap:
        case HoldemPokerState.hold:
            main.swapButton.active = main.holdButton.active = main.doubleButton.active = false;
            break;
        case HoldemPokerState.swapped:
        case HoldemPokerState.held:
            main.doubleAndCallButton.active = main.foldButton.active = true;
            break;
    }
};

export const showSlidingChipWithProcessingFail = (stateModel: HoldemPokerStateModel, betChipNode: cc.Node) => () => {
    if (stateModel.state === HoldemPokerState.calling_deal) {
        betChipNode.active = true;
    }
};

export const showHideTooltip = (bettingAreas: HoldemPokerBettingArea[]) => (stateModel: HoldemPokerStateModel) => {
    switch (stateModel.state) {
        case HoldemPokerState.all_bet:
        case HoldemPokerState.calling_deal:
        case HoldemPokerState.dealt:
            bettingAreas[1].showTooltip(false);
            bettingAreas[0].showTooltip(false);
            break;
        case HoldemPokerState.ante_bet:
            bettingAreas[1].showTooltip(true);
            bettingAreas[0].showTooltip(false);
            break;
        case HoldemPokerState.aa_bet:
        case HoldemPokerState.blank_new:
        case HoldemPokerState.replay_new:
            bettingAreas[0].showTooltip(true);
            bettingAreas[1].showTooltip(false);
            break;
        default:
            bettingAreas[0].showTooltip(false);
            bettingAreas[1].showTooltip(false);
            break;
    }
};

export const showHideClearIcon = (bettingAreas: HoldemPokerBettingArea[]) => (stateModel: HoldemPokerStateModel) => {
    switch (stateModel.state) {
        case HoldemPokerState.all_bet:
            bettingAreas[1].showClearIcon(true);
            bettingAreas[0].showClearIcon(true);
            break;
        case HoldemPokerState.ante_bet:
            bettingAreas[1].showClearIcon(false);
            bettingAreas[0].showClearIcon(true);
            break;
        case HoldemPokerState.aa_bet:
            bettingAreas[0].showClearIcon(false);
            bettingAreas[1].showClearIcon(true);
            break;
        default:
            bettingAreas[0].showClearIcon(false);
            bettingAreas[1].showClearIcon(false);
            break;
    }
};

export const showOwnBet = (gameData: HoldemPokerGameData, bettingAreas: HoldemPokerBettingArea[]) => () => {
    if (gameData.placeBetModel.choices[HoldemPokerChoicesConst.ante]) {
        bettingAreas[0].showBetValue(true);
        bettingAreas[0].showBetText(false);
        bettingAreas[0].ownBets = gameData.placeBetModel.choices[HoldemPokerChoicesConst.ante];
    }
    if (gameData.placeBetModel.choices[HoldemPokerChoicesConst.aa]) {
        bettingAreas[1].showBetValue(true);
        bettingAreas[1].showBetText(false);
        bettingAreas[1].ownBets = gameData.placeBetModel.choices[HoldemPokerChoicesConst.aa];
    }
    if (gameData.placeBetModel.choices[HoldemPokerChoicesConst.call]) {
        bettingAreas[2].showBetValue(true);
        bettingAreas[2].showBetText(false);
        bettingAreas[2].ownBets = gameData.placeBetModel.choices[HoldemPokerChoicesConst.call];
    }
};

export const clearUIData = (bettingAreas: HoldemPokerBettingArea[]) => () => {
    for (const [key] of Object.entries(bettingAreas)) {
        bettingAreas[key].showBetValue(false);
        bettingAreas[key].showClearIcon(false);
        bettingAreas[key].showBetText(true);
    }
};

export const showPlaceBetChips =
    (
        bettingAreas: HoldemPokerBettingArea[],
        betChips: BetChipsNew,
        shadowChip: cc.SpriteFrame,
        holdemPokerChips: HoldemPokerChips,
        gameData: HoldemPokerGameData,
        mainGame: HoldemPoker
    ) =>
    ({ currentChoice, currentAmount, totalAmount }) => {
        const bettingArea = bettingAreas.filter((a) => a.betChoice === currentChoice)[0];
        if (bettingArea && bettingArea.chipNode) {
            mainGame.playSingleChipsSound();
            holdemPokerChips.flyChipToBetPlace(betChips, bettingArea.chipNode, currentAmount, totalAmount);
        }
    };

export const clearBetChips =
    (bettingAreas: HoldemPokerBettingArea[]) =>
    ({ currentChoice }) => {
        const bettingArea = bettingAreas.filter((a) => a.betChoice === currentChoice)[0];
        if (bettingArea && bettingArea.chipNode) {
            bettingArea.chipNode.removeAllChildren();
            bettingArea.handleWinningAmount(0, false);
        }
    };

export const clearAllBetChips = (bettingAreas: HoldemPokerBettingArea[]) => () => {
    clearBetChips(bettingAreas)({ currentChoice: HoldemPokerChoicesConst.ante });
    clearBetChips(bettingAreas)({ currentChoice: HoldemPokerChoicesConst.aa });
    clearBetChips(bettingAreas)({ currentChoice: HoldemPokerChoicesConst.call });
    clearUIData(bettingAreas)();
};

export const updateChips =
    (bettingAreas: HoldemPokerBettingArea[], betChips: BetChipsNew, shadowChip: cc.SpriteFrame, holdemPokerChips: HoldemPokerChips) =>
    ({ choice, totalAmount, currentAmount }) => {
        const bettingArea = bettingAreas.filter((a) => a.betChoice === choice)[0];
        if (bettingArea && bettingArea.chipNode) {
            const values = GameUtils.getChipQuantity(currentAmount, betChips.chipValues);
            const keys = Object.keys(values).sort((a, b) => +b - +a);

            keys.forEach((chipValue) => {
                const count = values[chipValue];
                for (let i = 0; i < count; i++) {
                    holdemPokerChips.flyChipToBetPlace(betChips, bettingArea.chipNode, +chipValue, totalAmount);
                }
            });
        }
    };

export const updateAllChips =
    (bettingAreas: HoldemPokerBettingArea[], betChips: BetChipsNew, shadowChip: cc.SpriteFrame, holdemPokerChips: HoldemPokerChips) =>
    (placeBetModel: HoldemPokerPlaceBetModel) => {
        CasinoChoices.forEach((choice: string) => {
            if (placeBetModel.choices[choice] !== 0 && !placeBetModel.isUsingHand) {
                updateChips(
                    bettingAreas,
                    betChips,
                    shadowChip,
                    holdemPokerChips
                )({ choice: choice, totalAmount: placeBetModel.choices[choice], currentAmount: placeBetModel.choices[choice] });
            }
        });
    };

export const updateTotalBetLabel = (totalBetLabel: cc.Label) => (placingModel: HoldemPokerPlaceBetModel) => {
    let total = 0;
    if (!!placingModel.choices?.aa) {
        total += placingModel.choices.aa;
    }
    if (!!placingModel.choices?.ante) {
        total += placingModel.choices.ante;
    }
    if (!!placingModel.choices?.call) {
        total += placingModel.choices.call;
    }

    totalBetLabel.string = numberWithCommas(total);
};

export const prepareNewRound = (placeBet: HoldemPokerPlaceBetModel) => () => {
    placeBet.prepareNewRound();
};
