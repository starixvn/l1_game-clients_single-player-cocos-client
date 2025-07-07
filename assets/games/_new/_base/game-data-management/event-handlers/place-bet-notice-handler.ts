import { CommonEvents } from "../models/common-events";
import { BaseEventHandler } from "./base-handler";

export type PlaceBetNoticeEventType = {
    notice: string;
    endBet: number;
};

export class PlaceBetNoticeEventHandler extends BaseEventHandler<PlaceBetNoticeEventType> {
    protected verifyEvent(event: PlaceBetNoticeEventType) {
        return !!event.notice && event.endBet === -1;
    }

    protected handle(event: PlaceBetNoticeEventType) {
        this.gameData.isProcessingBet = false;

        this.gameData.emit(CommonEvents.NOTICE, event.notice);
    }
}
