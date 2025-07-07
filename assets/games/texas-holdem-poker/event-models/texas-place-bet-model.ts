import { HoldemPokerPlaceBetModel } from "../../holdem-poker/event-models/HoldemPokerPlaceBetModel";
import TexasChoicesModel from "./texas-choices-model";
import { TexasChoicesConst } from "../texas-constants";

export default class TexasPlaceBetModel extends HoldemPokerPlaceBetModel {
    constructor() {
        super();
        this.choices = new TexasChoicesModel();
        this.previousChoices = new TexasChoicesModel();
    }

    doubleAndCall(amount: number) {
        this.choices[TexasChoicesConst.callBet] = this.choices[TexasChoicesConst.anteBet] * 2;
        this.emit(TexasPlaceBetModel.Events.CALL, this);
        this.emit(TexasPlaceBetModel.Events.UPDATE_CHIPS, {
            choice: TexasChoicesConst.callBet,
            totalAmount: this.choices[TexasChoicesConst.callBet],
            currentAmount: amount
        });
    }

    updateBetModel(betChoice: string, betEvent: string, amount: number, choiceRef = TexasChoicesConst.anteBet, rate = 1) {
        if (rate <= 0) {
            return;
        }

        const betValue = this.choices[choiceRef] * rate;
        this.choices[betChoice] = betValue;
        this.emit(betEvent, this);
        this.emit(TexasPlaceBetModel.Events.UPDATE_CHIPS, {
            choice: betChoice,
            totalAmount: betValue,
            currentAmount: amount
        });
    }
}
