import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class BoostedOddsModel extends EventEmitterBase {
    static Events = {
        CHANGE: "BoostedOddsModel:CHANGE"
    };

    protected boostedOdds: any;

    change(boostedOdds: any) {
        this.boostedOdds = boostedOdds;
        this.emit(BoostedOddsModel.Events.CHANGE, this.boostedOdds);
    }

    updateUI() {
        this.boostedOdds && this.emit(BoostedOddsModel.Events.CHANGE, this.boostedOdds);
    }
}
