import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class HoldemPokerSettlement extends EventEmitterBase {
    static Events = {
        START_SETTLEMENT: "startSettlement",
        START_SHOW_CARDS: "startShowCards"
    };

    isWaiting = false;

    set waiting(value: boolean) {
        this.isWaiting = value;
    }

    startSettlement() {
        if (this.isWaiting) {
            this.emit(HoldemPokerSettlement.Events.START_SHOW_CARDS, this);
        }
        if (!this.isWaiting) {
            this.emit(HoldemPokerSettlement.Events.START_SETTLEMENT, this);
        }
    }

    finishShowCards() {
        this.emit(HoldemPokerSettlement.Events.START_SETTLEMENT, this);
    }
}
