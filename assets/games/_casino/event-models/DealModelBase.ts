import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export interface DealModelType {
    roundId: number;
}

export default class DealModelBase extends EventEmitterBase {
    static Events = {
        CHANGE: "afterDeal:change"
    };

    roundId: number;

    changeDataAfterDeal(options: DealModelType) {
        this.roundId = options.roundId;

        this.emit(DealModelBase.Events.CHANGE, this);
    }
}
