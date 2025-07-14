import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class HoldemPokerRoundCounter extends EventEmitterBase {
    static Events = {
        CHANGE: "roundId:change"
    };

    roundId: number;

    change(roundId: number) {
        this.roundId = roundId;
        this.emit(HoldemPokerRoundCounter.Events.CHANGE, this);
    }
}
