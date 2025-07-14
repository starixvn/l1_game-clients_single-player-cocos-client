import { EventEmitter } from "events";

export class HiLoStatusModel extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(0);
    }

    static Events = {
        WON: "collect:won",
        LOST: "collect:lost",
        COLLECT_FAILED: "collect:failed"
    };

    win: boolean;
    bet: number;

    isSettled = false;

    hasWon(bet: number) {
        this.bet = bet;
        this.win = true;
        this.isSettled = true;
        this.emit(HiLoStatusModel.Events.WON, this);
    }

    hasLost() {
        this.bet = 0;
        this.win = false;
        this.isSettled = true;
        this.emit(HiLoStatusModel.Events.LOST, this);
    }

    collectFailed() {
        this.emit(HiLoStatusModel.Events.COLLECT_FAILED);
    }

    reset() {
        this.isSettled = false;
    }
}
