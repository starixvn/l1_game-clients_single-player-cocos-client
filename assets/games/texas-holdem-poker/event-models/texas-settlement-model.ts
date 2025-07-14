import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export default class TexasSettlementModel extends EventEmitterBase {
    static Events = {
        START_SETTLEMENT: "startSettlement",
        START_SHOW_CARDS: "startShowCards",
        START_AUTO_CHECK: "startAutoCheck"
    };

    isWaiting = false;
    isAutoSettle = false;

    set waiting(value: boolean) {
        this.isWaiting = value;
    }
    set autoSettle(value: boolean) {
        this.isAutoSettle = value;
    }

    startSettlement() {
        if (this.isWaiting && !this.isAutoSettle) {
            this.emit(TexasSettlementModel.Events.START_SHOW_CARDS, this);
        }
        if (this.isWaiting && this.isAutoSettle) {
            this.emit(TexasSettlementModel.Events.START_AUTO_CHECK, this);
        }
        if (!this.isWaiting) {
            this.emit(TexasSettlementModel.Events.START_SETTLEMENT, this);
        }
    }

    finishShowCards() {
        this.emit(TexasSettlementModel.Events.START_SETTLEMENT, this);
    }
}
