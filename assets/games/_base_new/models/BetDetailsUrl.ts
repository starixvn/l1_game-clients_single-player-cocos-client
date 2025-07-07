import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class BetDetailsUrl extends EventEmitterBase {
    static Events = {
        CHANGE: "BetDetailsUrl:CHANGE"
    };

    change(betDetailsUrl: string) {
        this.emit(BetDetailsUrl.Events.CHANGE, betDetailsUrl);
    }
}
