import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class BoostedChoicesModel extends EventEmitterBase {
    static Events = {
        CHANGE: "BoostedChoicesModel:CHANGE"
    };

    protected boostedChoices: any;

    change(boostedChoices: any) {
        this.boostedChoices = boostedChoices;
        this.emit(BoostedChoicesModel.Events.CHANGE, this.boostedChoices);
    }

    updateUI() {
        this.boostedChoices && this.emit(BoostedChoicesModel.Events.CHANGE, this.boostedChoices);
    }
}
