import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

type FreeSpinDetail = {
    count: number;
    odds: number;
};

type FreeSpin = {
    initialOdds: Array<FreeSpinDetail>;
    additionalOdds: Array<FreeSpinDetail>;
};

type Odd = {
    from: number;
    to: number;
    odds: number;
};

export type CascadingSlotConfigData = {
    betLevels: number[];
    coinValues: number[];
    betMultiplier: number;
    maxWinPerRound: number;
    defaultCoinValue: number;
    odds: {
        freeSpins: FreeSpin;
        symbols: Record<string, Array<Odd>>;
    };
};

export class CascadingSlotConfigModel extends EventEmitterBase {
    static Events = {
        CHANGE: "configs:change"
    };

    data: CascadingSlotConfigData;

    change(data: CascadingSlotConfigData) {
        this.data = data;

        this.emit(CascadingSlotConfigModel.Events.CHANGE, data);
    }
}
