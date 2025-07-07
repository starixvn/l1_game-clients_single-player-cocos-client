import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import { CommonEvents } from "../../_new/_base/game-data-management/models/common-events";
import CascadingSlotGameData from "../models/CascadingSlotGameData";
import { CascadingSlotState } from "../models/CascadingSlotStateModel";

type ApiErrorEventType = {
    apiError: {
        gameRoundId: number;
        gameTypeId: number;
    };
    endBet?: number;
};

export class CascadingSlotApiErrorHandler extends BaseEventHandler<ApiErrorEventType> {
    protected readonly gameData: CascadingSlotGameData;
    protected verifyEvent(event: ApiErrorEventType) {
        return !!event.apiError;
    }

    protected handle(event: ApiErrorEventType) {
        if (this.gameData.stateModel.state === CascadingSlotState.Start_Round && !event.endBet) {
            this.gameData.emit(CommonEvents.SETTLE_API_ERROR, event.apiError);
        } else {
            this.gameData.emit(CommonEvents.API_ERROR, event.apiError);
        }
    }
}
