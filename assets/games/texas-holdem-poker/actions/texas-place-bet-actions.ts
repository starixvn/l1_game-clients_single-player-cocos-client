import BetChipsNew from "../../../common/bet-chips/view-models/BetChipsNew";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { updateChips } from "../../holdem-poker/actions/HoldemPokerPlaceBetActions";
import TexasGameDataModel from "../event-models/texas-game-data-model";
import TexasPlaceBetModel from "../event-models/texas-place-bet-model";
import TexasStateModel from "../event-models/texas-state-model";
import { TexasChoices, TexasChoicesConst } from "../texas-constants";
import { TexasChoicesType, TexasState } from "../texas-type";
import Texas from "../view-models/texas";
import TexasBettingArea from "../view-models/texas-betting-area";
import TexasChips from "../view-models/texas-chips";

export const showHideButtons = (main: Texas) => (stateModel: TexasStateModel) => {
    switch (stateModel.state) {
        case TexasState.ante_bet:
            main.dealButton.active = main.cancelButton.active = main.doubleButton.active = true;
            main.reBetAndDealButton.active = main.newButton.active = false;
            break;
        case TexasState.blank_new:
            main.disabledButtons(false);
            main.dealButton.active = main.cancelButton.active = main.doubleButton.active = false;
            main.reBetAndDealButton.active = main.newButton.active = false;
            break;
        case TexasState.prepare_new:
            main.reBetAndDealButton.active = main.newButton.active = true;
            main.callButton.active = main.foldButton.active = false;
            main.dealButton.active = main.doubleButton.active = main.cancelButton.active = false;
            main.disabledButtons(false);
            break;
        case TexasState.replay_new:
            main.callButton.active = main.foldButton.active = false;
            main.dealButton.active = main.doubleButton.active = main.cancelButton.active = main.newButton.active = false;
            main.disabledButtons(false);
            break;
        case TexasState.calling_deal:
            main.disabledButtons(true);
            break;
        case TexasState.dealing:
            main.disabledButtons(false);
            main.dealButton.active = main.doubleButton.active = main.cancelButton.active = false;
            main.reBetAndDealButton.active = main.newButton.active = false;
            break;
        case TexasState.dealt:
            main.trackSwapButtonShow();
            main.swapButton.active = main.holdButton.active = true;
            break;
        case TexasState.calling_call:
        case TexasState.calling_fold:
            main.callButton.active = main.foldButton.active = false;
            break;
        case TexasState.calling_called:
            main.turnButton.active = main.checkTurnButton.active = true;
            main.callButton.active = main.foldButton.active = false;
            break;
        case TexasState.calling_check_turn:
        case TexasState.calling_turning:
            main.turnButton.active = main.checkTurnButton.active = false;
            break;
        case TexasState.calling_turned:
            main.riverButton.active = main.checkRiverButton.active = true;
            main.turnButton.active = main.checkTurnButton.active = false;
            break;
        case TexasState.calling_rivering:
        case TexasState.calling_check_river:
            main.riverButton.active = main.checkRiverButton.active = false;
            break;
        case TexasState.settled:
            main.riverButton.active = main.checkRiverButton.active = false;
            main.swapButton.active = main.holdButton.active = false;
            break;
        case TexasState.swap:
        case TexasState.hold:
            main.swapButton.active = main.holdButton.active = main.doubleButton.active = false;
            break;
        case TexasState.swapped:
        case TexasState.held:
            main.callButton.active = main.foldButton.active = true;
            break;
    }
};

export const showPlaceBetChips = (
    bettingAreas: TexasBettingArea[],
    slidingChips: BetChipsNew,
    shadowChip: cc.SpriteFrame,
    texasChips: TexasChips,
    currentChoice: string,
    currentAmount: number,
    totalAmount: number
) => {
    const bettingArea = bettingAreas.filter((a) => a.betChoice === currentChoice)[0];
    if (bettingArea && bettingArea.chipNode) {
        texasChips.flyChipToBetPlace(slidingChips, bettingArea.chipNode, currentAmount, totalAmount);
    }
};

export const clearBetChips =
    (bettingAreas: TexasBettingArea[]) =>
    ({ currentChoice }) => {
        const bettingArea = bettingAreas.filter((a) => a.betChoice === currentChoice)[0];
        if (bettingArea && bettingArea.chipNode) {
            bettingArea.chipNode.removeAllChildren();
            bettingArea.handleWinningAmount(0, false);
        }
    };

export const clearAllBetChips = (bettingAreas: TexasBettingArea[]) => () => {
    clearBetChips(bettingAreas)({ currentChoice: TexasChoicesConst.anteBet });
    clearBetChips(bettingAreas)({ currentChoice: TexasChoicesConst.callBet });
    clearBetChips(bettingAreas)({ currentChoice: TexasChoicesConst.turnBet });
    clearBetChips(bettingAreas)({ currentChoice: TexasChoicesConst.riverBet });
    clearUIData(bettingAreas)();
};

export const updateAllChips =
    (bettingAreas: TexasBettingArea[], slidingChips: BetChipsNew, shadowChip: cc.SpriteFrame, texasChips: TexasChips) =>
    (placeBetModel: TexasPlaceBetModel) => {
        TexasChoices.forEach((choice: string) => {
            if (placeBetModel.choices[choice] !== 0 && !placeBetModel.isUsingHand) {
                updateChips(
                    bettingAreas,
                    slidingChips,
                    shadowChip,
                    texasChips
                )({ choice: choice, totalAmount: placeBetModel.choices[choice], currentAmount: placeBetModel.choices[choice] });
            }
        });
    };

export const showHideTooltip = (bettingAreas: TexasBettingArea[]) => (stateModel: TexasStateModel) => {
    switch (stateModel.state) {
        case TexasState.calling_deal:
        case TexasState.dealt:
            bettingAreas[0].showTooltip(false);
            break;
        case TexasState.ante_bet:
            bettingAreas[0].showTooltip(false);
            break;
        case TexasState.blank_new:
        case TexasState.replay_new:
            bettingAreas[0].showTooltip(true);
            break;
        default:
            bettingAreas[0].showTooltip(false);
            break;
    }
};

export const showOwnBet = (gameData: TexasGameDataModel<TexasChoicesType>, bettingAreas: TexasBettingArea[]) => () => {
    const renderOwnBet = (bettingAreas: TexasBettingArea[], choice: string, ownBetValue) => {
        const bettingArea = bettingAreas.find((e) => e.betChoice === choice);
        bettingArea.ownBets = ownBetValue;
        bettingArea.showBetValue(true);
        bettingArea.showBetText(false);
    };

    TexasChoices.forEach((choice: string) => {
        if (gameData.placeBetModel.choices[choice]) {
            renderOwnBet(bettingAreas, choice, gameData.placeBetModel.choices[choice]);
        }
    });
};

export const clearUIData = (bettingAreas: TexasBettingArea[]) => () => {
    for (const [key] of Object.entries(bettingAreas)) {
        bettingAreas[key].showBetValue(false);
        bettingAreas[key].showBetText(true);
    }
};

export const updateTotalBetLabel = (totalBetLabel: cc.Label) => (placingModel: TexasPlaceBetModel) => {
    let total = 0;
    if (!!placingModel.choices?.anteBet) {
        total += placingModel.choices.anteBet;
    }
    if (!!placingModel.choices?.callBet) {
        total += placingModel.choices.callBet;
    }
    if (!!placingModel.choices?.turnBet) {
        total += placingModel.choices.turnBet;
    }
    if (!!placingModel.choices?.riverBet) {
        total += placingModel.choices.riverBet;
    }
    totalBetLabel.string = numberWithCommas(total);
};

export const prepareNewRound = (placeBet: TexasPlaceBetModel) => () => {
    placeBet.prepareNewRound();
};
