import _ = require("lodash");

import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export interface PlaceBetData {
    betLevel: number;
    coinValue: number;
    freeSpin?: boolean;
    totalBet: number;
}

export default class CascadingSlotPlaceBetModel extends EventEmitterBase {
    static Events = {
        CHANGE: "bet:change"
    };

    data: PlaceBetData;

    change(data: PlaceBetData) {
        this.data = _.cloneDeep(data);
        this.emit(CascadingSlotPlaceBetModel.Events.CHANGE, this);
    }

    updateFreeSpin(value: boolean) {
        this.data.freeSpin = value;
    }
}
