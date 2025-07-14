import { cloneDeep } from "lodash";

import { TexasState } from "../texas-type";
import { TexasMaxBetChoices } from "../texas-constants";
import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export default class TexasStateModel extends EventEmitterBase {
    constructor() {
        super();
        this.state = TexasState.ante_bet;
        this.previousState = TexasState.blank_new;
        this.previousRound = false;
    }

    static Events = {
        CHANGE: "change",
        PREPARE_NEW_ROUND: "prepareNewRound",
        FORCE_UPDATE_BALANCE: "forceUpdateBalance"
    };
    previousState: number;
    state: number;
    previousRound: boolean;

    placeBet(choice) {
        if (choice === TexasMaxBetChoices.ante) {
            this.previousState = cloneDeep(this.state);
            this.state = TexasState.ante_bet;
            this.emit(TexasStateModel.Events.CHANGE, this);
        }
    }

    dealing() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.dealing;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    deal() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.calling_deal;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    cancelBet() {
        if (this.previousRound) {
            this.previousState = cloneDeep(this.state);
            this.state = TexasState.replay_new;
        } else {
            this.previousState = cloneDeep(this.state);
            this.state = TexasState.blank_new;
        }
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    afterDeal() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.dealt;
        this.previousRound = true;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    swapping() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.swapping;
        this.previousRound = true;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    swap() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.swap;
        this.previousRound = true;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    swapSuccess() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.swapped;
        this.previousRound = true;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    hold() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.hold;
        this.previousRound = true;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    holding() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.holding;
        this.previousRound = true;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    holdSuccess() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.held;
        this.previousRound = true;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    call() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.calling_call;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    callSuccess() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.calling_called;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    turning() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.calling_turning;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    checkTurn() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.calling_check_turn;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    turnSuccess() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.calling_turned;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    rivering() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.calling_rivering;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    checkRiver() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.calling_check_river;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    riveSuccess() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.prepare_new;
        this.emit(TexasStateModel.Events.PREPARE_NEW_ROUND, this);
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    fold() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.calling_fold;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    settle() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.settled;
        this.emit(TexasStateModel.Events.CHANGE, this);
        this.previousRound = true;
    }

    resetState() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.blank_new;
        this.previousRound = false;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    replayNew() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.replay_new;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    rebet() {
        this.previousState = cloneDeep(this.state);
        this.state = TexasState.ante_bet;
        this.emit(TexasStateModel.Events.CHANGE, this);
    }

    rejoinTable(communityCardLength: number, hasSwappedOrHold: boolean) {
        switch (communityCardLength) {
            case 4:
                this.turnSuccess();
                break;
            case 3:
                this.callSuccess();
                break;
            case 0:
                if (hasSwappedOrHold) {
                    this.swapSuccess();
                } else {
                    this.afterDeal();
                }

                break;
        }
    }

    clearBet: () => void;
    afterCall: () => void;
    holdemPokerChoiceAnte: (isFullBet: boolean) => void;
    holdemPokerChoiceAA: (isFullBet: boolean) => void;
}
