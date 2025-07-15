import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import { CascadingSlotFinishData } from "../models/CascadingSlotFinishModel";
import CascadingSlotGameData from "../models/CascadingSlotGameData";

export type FinishEventType = {
    finish: CascadingSlotFinishData;
};

export default class CascadingSlotFinishHandler extends BaseEventHandler<FinishEventType> {
    protected readonly gameData: CascadingSlotGameData;

    protected verifyEvent(data: FinishEventType) {
        return !!data.finish;
    }

    protected handle(data: FinishEventType) {
        this.gameData.finishModel.setData(data.finish);
    }
}
