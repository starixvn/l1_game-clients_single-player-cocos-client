import { APIErrorEventType, APIErrorHandler } from "../_new/_base/game-data-management/event-handlers/api-error-handler";
import { CommonEvents } from "../_new/_base/game-data-management/models/common-events";

export class SoloAPIErrorHandler extends APIErrorHandler {
    protected verifyEvent(event: APIErrorEventType) {
        return !!event.apiError;
    }

    protected handle(event: APIErrorEventType) {
        this.gameData.isProcessingBet = false;

        this.gameData.emit(CommonEvents.API_ERROR, event.apiError);
    }
}
