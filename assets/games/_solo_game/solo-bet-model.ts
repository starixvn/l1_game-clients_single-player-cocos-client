import { BetModel } from "../_base_new/models/BetModel";

export interface ChoiceBet {
    choice: string;
    amount: number;
}

export enum SoloBetState {
    READY = "ready",
    BETTING = "betting",
    BETTING_FAILED = "bettingFailed",
    RESULT = "result",
    SETTLEMENT = "settlement"
}

export class SoloBetModel extends BetModel {
    static Events = {
        ...BetModel.Events,
        CONFIRM_BET: "confirmBet",
        CHANGE_STATE: "changeState"
    };

    protected queueBet: ChoiceBet[] = [];
    protected lastQueueBet: ChoiceBet[] = [];
    protected currentBet = 0;
    state: string = SoloBetState.READY;

    changeState(state: string) {
        this.state = state;
        this.emit(SoloBetModel.Events.CHANGE_STATE, state);
        if (state === SoloBetState.READY) {
            this.resetLastBet();
        }
    }

    setCurrentBet(bet: number) {
        this.currentBet = +bet;
    }

    resetLastBet() {
        this.queueBet = [];
        this.updateOwnbets();
    }

    protected addTempBet(bet: ChoiceBet) {
        this.queueBet.push(bet);
    }

    addBet(choice: string) {
        this.addTempBet({ choice, amount: this.currentBet });
        this.flyOwnChipFake({ endBet: this.currentBet, betChoice: choice });
        this.updateOwnbets();
    }

    updateOwnbets() {
        const ownBets = {};
        this.queueBet.forEach((bet) => {
            const currentBet = ownBets[bet.choice] ?? 0;
            ownBets[bet.choice] = currentBet + bet.amount;
        });
        this.changeOwnBets(ownBets);
    }

    confirmBet() {
        this.changeState(SoloBetState.BETTING);
        this.lastQueueBet = this.queueBet;

        const confirmBet = {};
        this.queueBet.forEach((bet) => {
            const currentBet = confirmBet[bet.choice] ?? 0;
            confirmBet[bet.choice] = currentBet + bet.amount;
        });

        this.emit(SoloBetModel.Events.CONFIRM_BET, confirmBet);
    }

    reBet() {
        this.queueBet = this.lastQueueBet;
        this.updateOwnBetAndChips();
    }

    existBet() {
        return this.queueBet.length > 0;
    }

    updateOwnBetAndChips() {
        this.updateOwnbets();
        this.changeOwnChipsFake(this.ownBets);
    }

    getTotalBetOnChoice(choice: string) {
        return this.ownBets[choice] ?? 0;
    }

    undoBet() {
        if (this.queueBet.length > 0) {
            this.queueBet.pop();
            this.updateOwnBetAndChips();
        }
    }

    currentTotalBet() {
        return this.queueBet.reduce((acc, bet) => acc + bet.amount, 0);
    }

    currentChoiceAmount(choice: string) {
        return this.queueBet.filter((bet) => bet.choice === choice).reduce((acc, bet) => acc + bet.amount, 0);
    }
}
