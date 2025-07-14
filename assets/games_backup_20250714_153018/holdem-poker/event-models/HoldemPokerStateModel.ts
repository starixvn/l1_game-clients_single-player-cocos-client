import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

import { HoldemPokerChoicesConst } from "./HoldemPokerChoices";
import { HoldemPokerPlaceBetModel } from "./HoldemPokerPlaceBetModel";
import { HoldemPokerState } from "./HoldemPokerState";

export class HoldemPokerStateModel extends EventEmitterBase {
    constructor() {
        super();
        this.state = HoldemPokerState.blank_new;
        this.previousRound = false;
    }

    static Events = {
        CHANGE: "change",
        PREPARE_NEW_ROUND: "prepareNewRound"
    };

    state: number;
    previousRound: boolean;

    placeBet(choice, placeBetModel: HoldemPokerPlaceBetModel) {
        const isFullBet = placeBetModel.choices[HoldemPokerChoicesConst.ante] > 0 && placeBetModel.choices[HoldemPokerChoicesConst.aa] > 0;
        if (choice === HoldemPokerChoicesConst.ante) {
            this.holdemPokerChoiceAnte(isFullBet);
        }

        if (choice === HoldemPokerChoicesConst.aa) {
            this.holdemPokerChoiceAA(isFullBet);
        }
    }

    holdemPokerChoiceAnte(isFullBet: boolean) {
        if (
            this.state === HoldemPokerState.blank_new ||
            this.state === HoldemPokerState.replay_new ||
            (this.state === HoldemPokerState.calling_deal && !isFullBet)
        ) {
            this.state = HoldemPokerState.ante_bet;
            this.emit(HoldemPokerStateModel.Events.CHANGE, this);
        } else if (this.state === HoldemPokerState.aa_bet || (this.state === HoldemPokerState.calling_deal && isFullBet)) {
            this.state = HoldemPokerState.all_bet;
            this.emit(HoldemPokerStateModel.Events.CHANGE, this);
        }
    }

    holdemPokerChoiceAA(isFullBet: boolean) {
        if (this.state === HoldemPokerState.blank_new || this.state === HoldemPokerState.replay_new) {
            this.state = HoldemPokerState.aa_bet;
            this.emit(HoldemPokerStateModel.Events.CHANGE, this);
        } else if (this.state === HoldemPokerState.ante_bet || (this.state === HoldemPokerState.calling_deal && isFullBet)) {
            this.state = HoldemPokerState.all_bet;
            this.emit(HoldemPokerStateModel.Events.CHANGE, this);
        }
    }

    cancelBet() {
        if (this.previousRound) {
            this.state = HoldemPokerState.replay_new;
            this.emit(HoldemPokerStateModel.Events.CHANGE, this);
        } else {
            this.state = HoldemPokerState.blank_new;
        }
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    clearBet(choice) {
        if (choice === HoldemPokerChoicesConst.ante) {
            if (this.state === HoldemPokerState.all_bet) {
                this.state = HoldemPokerState.aa_bet;
                this.emit(HoldemPokerStateModel.Events.CHANGE, this);
            } else {
                this.cancelBet();
            }
        }

        if (choice === HoldemPokerChoicesConst.aa) {
            if (this.state === HoldemPokerState.all_bet) {
                this.state = HoldemPokerState.ante_bet;
                this.emit(HoldemPokerStateModel.Events.CHANGE, this);
            } else {
                this.cancelBet();
            }
        }
    }

    deal() {
        this.state = HoldemPokerState.calling_deal;
        this.previousRound = true;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    swapping() {
        this.state = HoldemPokerState.swapping;
        this.previousRound = true;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    swap() {
        this.state = HoldemPokerState.swap;
        this.previousRound = true;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    swapSuccess() {
        this.state = HoldemPokerState.swapped;
        this.previousRound = true;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    hold() {
        this.state = HoldemPokerState.hold;
        this.previousRound = true;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    holding() {
        this.state = HoldemPokerState.holding;
        this.previousRound = true;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    holdSuccess() {
        this.state = HoldemPokerState.held;
        this.previousRound = true;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    call() {
        this.state = HoldemPokerState.calling_call;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    callSuccess() {
        this.state = HoldemPokerState.calling_called;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    fold() {
        this.state = HoldemPokerState.calling_fold;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    settle() {
        this.state = HoldemPokerState.settled;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    dealing() {
        this.state = HoldemPokerState.dealing;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    afterDeal() {
        this.state = HoldemPokerState.dealt;
        this.previousRound = true;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    afterCall() {
        this.state = HoldemPokerState.prepare_new;
        this.emit(HoldemPokerStateModel.Events.PREPARE_NEW_ROUND, this);
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    resetState() {
        this.state = HoldemPokerState.blank_new;
        this.previousRound = false;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    replayNew() {
        this.state = HoldemPokerState.replay_new;
        this.emit(HoldemPokerStateModel.Events.CHANGE, this);
    }

    rejoinTable(communityCardLength: number, hasSwappedOrHold: boolean) {
        if (hasSwappedOrHold) {
            this.swapSuccess();
        } else {
            this.afterDeal();
        }
    }

    turnSuccess: () => void;
    rivering: () => void;
    checkRiver: () => void;
    riveSuccess: () => void;
}
