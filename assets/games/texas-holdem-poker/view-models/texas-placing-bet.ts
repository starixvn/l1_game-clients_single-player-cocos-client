import GameBase from "../../../games/_base/GameBase";
import Connection from "../../_new/connection/Connection";
import { events } from "../../_new/connection/SocketIOConnection";
import TexasGameDataModel from "../event-models/texas-game-data-model";
import { BetAction, TexasChoicesConst } from "../texas-constants";
import { TexasChoicesType, TexasState } from "../texas-type";
import { validateAccountBalance, validateAccountBalanceForFullRound, validateBet } from "./texas-validate-placing-bet";

export default class TexasPlacingBet {
    private readonly gameData: TexasGameDataModel<TexasChoicesType> = null;
    private readonly gameBase: GameBase = null;
    private readonly getConnection: () => Connection;

    constructor(gameData: TexasGameDataModel<TexasChoicesType>, gameBase: GameBase, getConnection: () => Connection) {
        this.gameData = gameData;
        this.gameBase = gameBase;
        this.getConnection = getConnection;
    }

    placeBet(betChoice: string, betAmount: number) {
        if (
            betChoice === TexasChoicesConst.anteBet &&
            (this.gameData.stateModel.state === TexasState.blank_new ||
                this.gameData.stateModel.state === TexasState.ante_bet ||
                this.gameData.stateModel.state === TexasState.replay_new ||
                this.gameData.stateModel.state === TexasState.calling_deal)
        ) {
            this.gameBase.playClick();
            if (this.gameData.isProcessingBet) {
                this.gameData.emit(TexasGameDataModel.Events.SHOW_PROCESSING_BET);
            } else {
                if (this.gameBase.waitingProcessing) {
                    return false;
                }
                if (this.validateBetting(betAmount, betChoice)) {
                    this.gameData.receiveUIData({ bet: { choice: betChoice, amount: betAmount } });
                }
                return true;
            }
        }
        return true;
    }

    private getTotalBet() {
        return Object.keys(this.gameData.placeBetModel.choices).reduce((sum, current) => {
            return sum + this.gameData.placeBetModel.choices[current];
        }, 0);
    }

    doubleBet(betChoice: string, betAmount: number) {
        if (this.validateBetting(betAmount, betChoice)) {
            this.gameData.receiveUIData({ double: { choice: betChoice, amount: betAmount } });
        }
    }

    clear() {
        this.gameData.receiveUIData({
            cancel: {}
        });
        this.getConnection().emit("bet", { action: "settle" });
    }

    sendBetData(data) {
        data["clientSentTime"] = new Date();
        this.getConnection().emit(events.bet, data);
    }

    handleClickButton(betChoice: string, betAmount: number, betAction: string, payload?: any) {
        if (this.validateBetting(betAmount, betChoice)) {
            this.gameData.isProcessingBet = true;
            const stateUI = {};
            stateUI[betAction] = { amount: betAmount };
            this.gameData.receiveUIData(stateUI);
            this.sendBetData({
                action: betAction,
                ...payload
            });
        }
    }

    handleClickDeal() {
        const validateResult = validateAccountBalanceForFullRound({
            chipAmount: 0,
            currentBettedAmount: this.gameData.placeBetModel.choices.anteBet,
            userBalance: this.gameBase.getUserBalance(),
            showMiniWarningFunc: (mes) => this.gameBase.showMiniWarning(mes),
            maxBetPerRound: this.gameBase.getMaxBet()
        });
        if (validateResult) {
            this.gameData.isProcessingBet = true;
            this.gameData.receiveUIData({
                deal: {}
            });
            this.gameBase.lockBet();
            this.sendBetData({
                action: BetAction.deal,
                anteBet: this.gameData.placeBetModel.choices.anteBet
            });
        } else {
            this.gameData.stateModel.resetState();
            this.gameData.placeBetModel.resetBets();
        }
    }

    handleClickOnChoice(betChoice: string) {
        this.gameData.isProcessingBet = true;
        const stateUI = {};
        stateUI[betChoice] = {};
        this.gameData.receiveUIData(stateUI);
        this.sendBetData({
            action: betChoice
        });
    }

    handleClickButtonNoneBet(betAction: string, payload?: any) {
        this.gameData.isProcessingBet = true;
        const stateUI = {};
        stateUI[betAction] = {};
        this.gameData.receiveUIData(stateUI);
        this.sendBetData({
            action: betAction,
            ...payload
        });
    }

    rebetAndDeal() {
        const currentTotal = Object.keys(this.gameData.placeBetModel.previousChoices).reduce((sum, current) => {
            return sum + this.gameData.placeBetModel.previousChoices[current];
        }, 0);
        if (
            validateAccountBalanceForFullRound({
                chipAmount: 0,
                currentBettedAmount: currentTotal,
                userBalance: this.gameBase.getUserBalance(),
                showMiniWarningFunc: (mes) => this.gameBase.showMiniWarning(mes),
                maxBetPerRound: this.gameBase.getMaxBet()
            })
        ) {
            this.gameData.isProcessingBet = true;
            this.gameData.receiveUIData({
                rebetAndDeal: { amount: currentTotal }
            });
            this.gameBase.lockBet();
            this.sendBetData({
                action: BetAction.deal,
                ...this.gameData.placeBetModel.choices
            });
        } else {
            this.gameData.receiveUIData({
                replayNew: {}
            });
        }
    }

    private getMaxBetAndStakePerChoice(betChoice: string): number {
        return Math.min(this.gameData.configs.maxBetChoices[TexasChoicesConst[betChoice]], this.gameBase.getMaxBet());
    }

    protected validateBetting(betAmount: number, betChoice: string) {
        return (
            validateBet({
                chipAmount: betAmount,
                currentBettedAmount: this.gameData.placeBetModel.choices[betChoice],
                currentTotalBettedAmount: this.getTotalBet(),
                betChoice: betChoice,
                showMiniWarningFunc: (mes) => this.gameBase.showMiniWarning(mes),
                minBet: this.gameData.configs.minBet,
                maxBetPerChoice: this.gameData.configs.maxBetChoices[betChoice],
                maxBetPerRound: this.gameBase.getMaxBet(),
                waitingProcessing: this.gameBase.waitingProcessing,
                getMaxBetAndStakePerChoice: this.getMaxBetAndStakePerChoice.bind(this),
                minBetPerRound: this.gameBase.getMinBet()
            }) &&
            validateAccountBalance({
                chipAmount: betAmount,
                currentBettedAmount: this.gameData.placeBetModel.choices[betChoice],
                userBalance: this.gameBase.getUserBalance(),
                showMiniWarningFunc: (mes) => this.gameBase.showMiniWarning(mes)
            })
        );
    }
}
