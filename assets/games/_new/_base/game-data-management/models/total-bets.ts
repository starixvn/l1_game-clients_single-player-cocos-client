import EventEmitterBase from "../../../../../common/emitter/EventEmitterBase";

type Choices = any;

export class TotalBets extends EventEmitterBase {
    static Events = {
        CHANGE: "totalBets:change"
    };

    public data: Choices;

    clearData() {
        this.data = null;
    }

    update(choices: Choices) {
        this.data = choices;
        this.emit(TotalBets.Events.CHANGE, this.data);
    }

    updateUI() {
        this.data && this.emit(TotalBets.Events.CHANGE, this.data);
    }
}
