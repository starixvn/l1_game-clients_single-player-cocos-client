import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export enum SpinButtonState {
    Normal = 0,
    AutoSpin,
    FreeSpin,
    ResumeWithFreeSpin
}

export default class SpinButtonStateModel extends EventEmitterBase {
    static Events = {
        CHANGE: "spin-button:change"
    };

    state: SpinButtonState;

    change(state: SpinButtonState) {
        this.state = state;
        this.emit(SpinButtonStateModel.Events.CHANGE, state);
    }
}
