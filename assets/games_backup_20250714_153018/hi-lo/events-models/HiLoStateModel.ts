import { EventEmitter } from "events";

import { HiLoState } from "./HiLoState";

export class HiLoStateModel extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(0);
        this.state = HiLoState.BLANK_NEW;
    }

    static Events = {
        CHANGE: "change"
    };

    state: number;

    prepareNewRound() {
        this.state = HiLoState.BLANK_NEW;
        this.emit(HiLoStateModel.Events.CHANGE, this);
    }

    inTurn() {
        this.state = HiLoState.IN_TURN;
        this.emit(HiLoStateModel.Events.CHANGE, this);
    }

    collect() {
        this.state = HiLoState.SETTLED;
        this.emit(HiLoStateModel.Events.CHANGE, this);
    }
}
