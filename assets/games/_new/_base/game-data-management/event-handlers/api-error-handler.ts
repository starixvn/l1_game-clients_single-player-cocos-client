import { CommonEvents } from "../models/common-events";
import { BaseEventHandler } from "./base-handler";

export type APIErrorEventType = {
    apiError: {
        gameRoundId: number;
        gameTypeId: number;
        isPlaceBetFailed: boolean;
        message: string;
    };
    err: string;
};

export class APIErrorHandler extends BaseEventHandler<APIErrorEventType> {
    protected verifyEvent(event: APIErrorEventType) {
        return !!event.apiError || !!event.err;
    }

    protected handle(event: APIErrorEventType) {
        this.gameData.isProcessingBet = false;

        this.gameData.emit(CommonEvents.API_ERROR, event.apiError.message || event.err);
    }
}
