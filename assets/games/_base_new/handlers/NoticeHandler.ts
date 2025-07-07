import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

export type NoticeType = {
    notice: any;
};

export class NoticeHandler extends BaseEventHandler<NoticeType> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: NoticeType) {
        return event.notice != null;
    }

    protected handle(event: NoticeType) {
        this.gameData.notice.change(event.notice);
    }
}
