import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export interface Settlement {
    explode: number[];
    new: number[];
}

export interface Tumble {
    icons: any;
    win: number;
    settlement: Settlement;
    result: string;
    multipliers: number[];
}

export interface WinIconDetail {
    count: number;
    win: number;
}

export interface CascadingSlotFinishData {
    roundId: number;
    result: string;

    multiplier: number;
    totalMultiplier: number;

    actualBetwin: number;
    win: number;
    bigWin: boolean;
    totalFreeSpins: number;
    freeSpins: number;
    isFreeSpin: boolean;

    tumbles: Tumble[];
    m: number[];
    reachMaxWin: boolean;
}

export class CascadingSlotFinishModel extends EventEmitterBase {
    static Events = {
        SETTLE: "finish:settle"
    };

    data: CascadingSlotFinishData;

    setData(data: CascadingSlotFinishData) {
        this.data = data;

        this.emit(CascadingSlotFinishModel.Events.SETTLE, data);
    }
}
