import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export enum CascadingSlotState {
    None = 0,
    Start_Round,
    Spinning,
    Settled
}

export class CascadingSlotStateModel extends EventEmitterBase {
    static Events = {
        CHANGE: "state:change"
    };

    state: CascadingSlotState;

    change(state: CascadingSlotState) {
        this.state = state;
        this.emit(CascadingSlotStateModel.Events.CHANGE, state);
    }
}
