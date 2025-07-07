import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

export type UMType = {
    um?: any;
    snr?: boolean;
    remainingTime?: number;
};

export class UMHandler extends BaseEventHandler<UMType> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: UMType) {
        return true;
    }

    protected handle(event: UMType) {
        if (event.um) {
            this.gameData.isUnderMaintenance = true;
            this.gameData.umModel.onUM(event);
        }
        if (event.snr || event.um === false || (event.remainingTime > 0 && event.remainingTime !== this.gameData.durations.wholeRound)) {
            this.gameData.umModel.checkToOffUM(event);
            this.gameData.isUnderMaintenance = false;
        }
    }
}
