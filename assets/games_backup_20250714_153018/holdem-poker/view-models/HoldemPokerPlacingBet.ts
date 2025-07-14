import * as i18n from "i18n/runtime-scripts/LanguageData";

import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import GameBase from "../../../games/_base/GameBase";
import Connection from "../../_new/connection/Connection";
import { events } from "../../_new/connection/SocketIOConnection";
import { HoldemPokerChoicesConst, HoldemPokerMaxBetChoicesConst } from "../event-models/HoldemPokerChoices";
import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";
import { HoldemPokerState } from "../event-models/HoldemPokerState";
import HoldemPokerBettingArea from "./HoldemPokerBettingArea";

export default class HoldemPokerPlacingBet {
    private readonly gameData: HoldemPokerGameData = null;
    private readonly bettingAreas: HoldemPokerBettingArea[] = null;
    private readonly gameBase: GameBase = null;
    private readonly getConnection: () => Connection;

    constructor(
        gameData: HoldemPokerGameData,
        bettingAreas: HoldemPokerBettingArea[],
        gameBase: GameBase,
        getConnection: () => Connection
    ) {
        this.gameData = gameData;
        this.bettingAreas = bettingAreas;
        this.gameBase = gameBase;
        this.getConnection = getConnection;
    }

    placeBet(betChoice: string, betAmount: number) {
        if (
            betChoice !== HoldemPokerChoicesConst.call &&
            (this.gameData.stateModel.state === HoldemPokerState.blank_new ||
                this.gameData.stateModel.state === HoldemPokerState.ante_bet ||
                this.gameData.stateModel.state === HoldemPokerState.aa_bet ||
                this.gameData.stateModel.state === HoldemPokerState.all_bet ||
                this.gameData.stateModel.state === HoldemPokerState.replay_new ||
                this.gameData.stateModel.state === HoldemPokerState.calling_deal)
        ) {
            if (this.gameData.isProcessingBet) {
                this.gameData.emit(HoldemPokerGameData.Events.SHOW_PROCESSING_BET);
            } else if (this.validateBet(betChoice, betAmount) && this.validateAccountBalance(betAmount)) {
                this.gameData.receiveUIData({ bet: { choice: betChoice, amount: betAmount } });
            }
        }
    }

    doubleBet(betChoice: string, betAmount: number) {
        if (this.validateBet(betChoice, betAmount) && this.validateAccountBalance(betAmount)) {
            this.gameData.receiveUIData({ double: { choice: betChoice, amount: betAmount } });
        }
    }

    sendBetData(data) {
        data["clientSentTime"] = new Date();
        this.getConnection().emit(events.bet, data);
    }

    doubleAndCallBet(betChoice: string, betAmount: number) {
        if (this.validateBet(betChoice, betAmount) && this.validateAccountBalance(betAmount)) {
            this.gameData.isProcessingBet = true;
            this.gameData.receiveUIData({ doubleAndCall: { amount: betAmount } });
            this.gameBase.lockBet();
            this.sendBetData({
                doubleCall: {}
            });
        }
    }

    rebetAndDeal() {
        const currentTotal = Object.keys(this.gameData.placeBetModel.previousChoices).reduce((sum, current) => {
            const currentValue =
                current === HoldemPokerChoicesConst.ante
                    ? this.gameData.placeBetModel.previousChoices[current] * 3
                    : this.gameData.placeBetModel.previousChoices[current];
            return sum + currentValue;
        }, 0);
        if (this.validateAccountBalanceForFullRound(currentTotal)) {
            this.gameData.isProcessingBet = true;
            this.gameData.receiveUIData({
                rebetAndDeal: { amount: currentTotal }
            });
            this.gameBase.lockBet();
            this.sendBetData({
                deal: this.gameData.placeBetModel.choices
            });
        } else {
            this.gameData.receiveUIData({
                replayNew: {}
            });
        }
    }

    dealBet() {
        if (this.validateAccountBalanceForFullRound(0)) {
            this.gameData.isProcessingBet = true;
            this.gameData.receiveUIData({
                deal: {}
            });
            this.gameBase.lockBet();
            this.sendBetData({
                deal: this.gameData.placeBetModel.choices
            });
        }
    }

    swap() {
        if (this.validateAccountBalanceForFullRound(0)) {
            this.gameData.isProcessingBet = true;
            this.gameData.receiveUIData({
                swap: {}
            });
            this.sendBetData({
                swap: {}
            });
        }
    }

    hold() {
        if (this.validateAccountBalanceForFullRound(0)) {
            this.gameData.isProcessingBet = true;
            this.gameData.receiveUIData({
                hold: {}
            });
            this.sendBetData({
                hold: {}
            });
        }
    }

    private validateBet(betChoice: string, amount: number): boolean {
        if (this.gameBase.waitingProcessing) {
            return false;
        }

        const conditions: { condition: boolean; message?: string; hasIcon?: boolean }[] = [
            {
                condition: this.checkMinBetPerChoice(betChoice, amount),
                message: i18n.t("messages.minBetForChoiceNotice", {
                    minBet: numberWithCommas(this.gameBase.getMinBet())
                })
            },
            {
                condition: this.checkMaxBetPerChoice(betChoice, amount),
                message: i18n.t("messages.maxBetForChoiceNotice2", {
                    maxBet: numberWithCommas(this.getMaxBetAndStakePerChoice(betChoice))
                })
            },
            {
                condition: this.checkTotalBet(amount),
                message: i18n.t("messages.maxBetNotice", {
                    maxBet: numberWithCommas(this.gameBase.getMaxBet())
                })
            }
        ];

        const criteria = conditions.reduce((result, element) => (!result && element.condition ? element : result), null);

        if (criteria && criteria.message) {
            this.gameBase.showMiniWarning(criteria.message);
        }

        return !criteria;
    }

    private validateAccountBalance(amount: number): boolean {
        const conditions: { condition: boolean; message?: string; hasIcon?: boolean }[] = [
            {
                condition: this.checkBalance(amount),
                message: i18n.t("messages.notEnoughMoney")
            }
        ];

        const criteria = conditions.reduce((result, element) => (!result && element.condition ? element : result), null);

        if (criteria && criteria.message) {
            this.gameBase.showMiniWarning(criteria.message);
        }

        return !criteria;
    }

    private validateAccountBalanceForFullRound(amount: number) {
        const conditions: { condition: boolean; message?: string; hasIcon?: boolean }[] = [
            {
                condition: this.checkBalance(amount, true),
                message: i18n.t("messages.notEnoughMoneyCardGame")
            }
        ];

        const criteria = conditions.reduce((result, element) => (!result && element.condition ? element : result), null);

        if (criteria && criteria.message) {
            this.gameBase.showMiniWarning(criteria.message);
        }

        return !criteria;
    }

    private checkBalance(amount: number, isClickDeal = false) {
        let total: number;

        if (
            this.gameData.stateModel.state === HoldemPokerState.dealt ||
            this.gameData.stateModel.state === HoldemPokerState.prepare_new ||
            this.gameData.stateModel.state === HoldemPokerState.replay_new ||
            this.gameData.stateModel.state === HoldemPokerState.held ||
            this.gameData.stateModel.state === HoldemPokerState.swapped
        ) {
            total = amount;
        } else {
            total = isClickDeal ? this.getTotalBetWhenClickDeal() : this.getTotalBet() + amount;
        }

        return total > this.gameBase.getUserBalance();
    }

    private getMaxBetAndStakePerChoice(betChoice: string): number {
        return Math.min(this.gameData.configs.maxBetChoices[HoldemPokerMaxBetChoicesConst[betChoice]], this.gameBase.getMaxBet());
    }

    private checkMaxBetPerChoice(betChoice: string, amount: number) {
        if (this.gameData.configs && this.gameData.configs.maxBetChoices) {
            let unconfirmedTotal = amount;
            const confirmedUBetPerChoice = this.gameData.placeBetModel.choices[betChoice];
            if (confirmedUBetPerChoice && confirmedUBetPerChoice > 0) {
                unconfirmedTotal = confirmedUBetPerChoice + amount;
            }

            return this.getMaxBetAndStakePerChoice(betChoice) < unconfirmedTotal;
        }

        return false;
    }

    private checkMinBetPerChoice(betChoice: string, amount: number) {
        if (this.gameData.configs && this.gameData.configs.minBet) {
            let unconfirmedTotal = amount;
            const confirmedUBetPerChoice = this.gameData.placeBetModel.choices[betChoice];
            if (confirmedUBetPerChoice && confirmedUBetPerChoice > 0) {
                unconfirmedTotal = confirmedUBetPerChoice + amount;
            }

            return this.gameData.configs.minBet > unconfirmedTotal;
        }

        return false;
    }

    private checkTotalBet(amount: number) {
        const currentTotal = this.getTotalBet();
        return currentTotal + amount > this.gameBase.getMaxBet();
    }

    private getTotalBet() {
        return Object.keys(this.gameData.placeBetModel.choices).reduce((sum, current) => {
            return sum + this.gameData.placeBetModel.choices[current];
        }, 0);
    }
    private getTotalBetWhenClickDeal() {
        return Object.keys(this.gameData.placeBetModel.choices).reduce((sum, current) => {
            const currentValue =
                current === HoldemPokerChoicesConst.ante
                    ? this.gameData.placeBetModel.choices[current] * 3
                    : this.gameData.placeBetModel.choices[current];
            return sum + currentValue;
        }, 0);
    }
}
