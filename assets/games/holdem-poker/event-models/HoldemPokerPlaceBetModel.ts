import { cloneDeep } from "lodash";

import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import HoldemPokerChoices, { HoldemPokerChoicesConst } from "./HoldemPokerChoices";

export class HoldemPokerPlaceBetModel extends EventEmitterBase {
    constructor() {
        super();
        this.choices = new HoldemPokerChoices();
        this.previousChoices = new HoldemPokerChoices();
    }

    static Events = {
        PLACE_BET: "placeBet",
        PLACE_BET_CHIPS: "placeBetChips",
        CLEAR_BET_CHIPS: "clearBetChips",
        CLEAR_ALL_BET_CHIPS: "clearAllBetChips",
        UPDATE_CHIPS: "updateChips",
        UPDATE_ALL_CHIPS: "updateAllChips",
        CLEAR_BETS: "clear",
        DOUBLE: "double",
        CALL: "call",
        DEAL: "deal",
        UPDATE_GAME_ROUND: "updateGameRound",

        TURN: "turn",
        RIVER: "river",
        UPDATE_TOTAL_BET: "updateTotalBet"
    };

    choices: any;
    previousChoices: any;
    isUsingHand = false;

    placeBet(choice: string, amount: number) {
        this.choices[choice] = this.choices[choice] ? this.choices[choice] + amount : amount;
        this.emit(HoldemPokerPlaceBetModel.Events.PLACE_BET, this);
        this.emit(HoldemPokerPlaceBetModel.Events.PLACE_BET_CHIPS, {
            currentChoice: choice,
            currentAmount: amount,
            totalAmount: this.choices[choice]
        });
    }

    double(choice: string, amount: number) {
        this.choices[choice] = this.choices[choice] * 2;
        this.emit(HoldemPokerPlaceBetModel.Events.DOUBLE, this);
        this.emit(HoldemPokerPlaceBetModel.Events.UPDATE_CHIPS, {
            choice: choice,
            totalAmount: this.choices[choice],
            currentAmount: amount
        });
    }

    resetBets() {
        for (const [key] of Object.entries(this.choices)) {
            this.choices[key] = 0;
        }
        this.emit(HoldemPokerPlaceBetModel.Events.CLEAR_BETS, this);
        this.emit(HoldemPokerPlaceBetModel.Events.CLEAR_ALL_BET_CHIPS, {});
    }

    clear(choice) {
        delete this.choices[choice];
        this.emit(HoldemPokerPlaceBetModel.Events.CLEAR_BETS, this);
        this.emit(HoldemPokerPlaceBetModel.Events.CLEAR_BET_CHIPS, {
            currentChoice: choice
        });
    }

    deal(choices) {
        this.previousChoices = cloneDeep(choices);
        this.emit(HoldemPokerPlaceBetModel.Events.DEAL, this);
    }

    rebet() {
        this.choices = cloneDeep(this.previousChoices);
        this.emit(HoldemPokerPlaceBetModel.Events.PLACE_BET, this);
        this.emit(HoldemPokerPlaceBetModel.Events.UPDATE_GAME_ROUND, this);
    }

    rebetAndDeal() {
        this.rebet();
    }

    doubleAndCall(amount: number) {
        this.choices[HoldemPokerChoicesConst.call] = this.choices[HoldemPokerChoicesConst.ante] * 2;
        this.emit(HoldemPokerPlaceBetModel.Events.CALL, this);
        this.emit(HoldemPokerPlaceBetModel.Events.UPDATE_CHIPS, {
            choice: HoldemPokerChoicesConst.call,
            totalAmount: this.choices[HoldemPokerChoicesConst.call],
            currentAmount: amount
        });
    }

    updateDeal(choices: any) {
        this.choices = cloneDeep(choices);
        this.emit(HoldemPokerPlaceBetModel.Events.UPDATE_ALL_CHIPS, this);
        this.isUsingHand = false;
    }

    rejoinTable(rejoinChoices: any) {
        this.choices = cloneDeep(rejoinChoices);
        this.emit(HoldemPokerPlaceBetModel.Events.CLEAR_ALL_BET_CHIPS, {});
        this.emit(HoldemPokerPlaceBetModel.Events.PLACE_BET, this);
        this.emit(HoldemPokerPlaceBetModel.Events.UPDATE_ALL_CHIPS, this);
    }

    prepareNewRound() {
        for (const [key] of Object.entries(this.choices)) {
            this.choices[key] = 0;
        }
    }

    new() {
        for (const [key] of Object.entries(this.previousChoices)) {
            delete this.previousChoices[key];
        }
        this.emit(HoldemPokerPlaceBetModel.Events.CLEAR_BETS, this);
        this.emit(HoldemPokerPlaceBetModel.Events.UPDATE_GAME_ROUND, {});
    }

    replayNew(amount: number) {
        this.emit(HoldemPokerPlaceBetModel.Events.CLEAR_BETS, this);
        this.emit(HoldemPokerPlaceBetModel.Events.UPDATE_GAME_ROUND, {});
    }
}
