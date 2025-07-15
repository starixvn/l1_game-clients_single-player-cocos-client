import { BetModel } from "../_base_new/models/BetModel";

export interface ChoiceBet {
    choice: string;
    amount: number;
}

export enum SoloBetState {
    READY = "ready",
    STARTING_ROUND = "startingRound",
    BETTING = "betting",
    BETTING_FAILED = "bettingFailed",
    RESULT = "result",
    SETTLEMENT = "settlement",
    PLACE_BET_FAILED = "placeBetFailed",
    PLACE_BET_SUCCESS = "placeBetSuccess",
    START_BET = "startBet"
}

export class SoloBetModel extends BetModel {
    static Events = {
        ...BetModel.Events,
        CONFIRM_BET: "confirmBet",
        CHANGE_STATE: "changeState"
    };

    protected queueBet: ChoiceBet[] = [];
    protected currentBet = 0;
    lastQueueBet: ChoiceBet[] = [];
    state: string = SoloBetState.READY;

    changeState(state: string) {
        this.state = state;
        if (state === SoloBetState.READY) {
            this.resetLastBet();
        }

        this.emit(SoloBetModel.Events.CHANGE_STATE, state);
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
        const tempBet = { choice, amount: this.currentBet };
        
        this.addTempBet(tempBet);
        const ownBets = { endBet: this.currentBet, betChoice: choice };
        
        this.flyOwnChipFake(ownBets);
        this.updateOwnbets();
    }

    receiveOwnBets(tempBets: any, ownBets: any) {
        this.addTempBet(tempBets);
        this.flyOwnChipFake(ownBets);
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

        this.emit(SoloBetModel.Events.CONFIRM_BET);
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
        return this.ownBets?.[choice] ?? 0;
    }

    currentTotalBet() {
        return this.queueBet.reduce((acc, bet) => acc + bet.amount, 0);
    }

    currentChoiceAmount(choice: string) {
        return this.queueBet.filter((bet) => bet.choice === choice).reduce((acc, bet) => acc + bet.amount, 0);
    }
}
