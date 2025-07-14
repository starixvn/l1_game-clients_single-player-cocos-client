import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import CascadingSlotGameData from "../models/CascadingSlotGameData";
import { SpinButtonState } from "../models/SpinButtonStateModel";

type IngameEventType = {
    totalMultiplier: number;
    freeSpins: { total: number; betLevel: number; coinValue: number };
};

export class CascadingSlotIngameHandler extends BaseEventHandler<IngameEventType> {
    protected readonly gameData: CascadingSlotGameData;
    protected verifyEvent(event: IngameEventType) {
        return !!event.totalMultiplier || !!event.freeSpins;
    }

    protected handle(event: IngameEventType) {
        const { totalMultiplier, freeSpins } = event;
        if (totalMultiplier > 0) {
            this.gameData.uiModel.changeTotalMultiplier({ value: totalMultiplier, show: true });
        }
        if (freeSpins && freeSpins.total > 0) {
            const { coinValue, betLevel } = freeSpins;
            this.gameData.uiModel.setStakeFreeSpin(coinValue, betLevel);
            this.gameData.uiModel.setFreeSpins(freeSpins.total);
            this.gameData.uiModel.showFreeSpins(true);
            this.gameData.spinButtonStateModel.change(SpinButtonState.ResumeWithFreeSpin);
        } else {
            this.gameData.spinButtonStateModel.change(SpinButtonState.Normal);
        }
    }
}
