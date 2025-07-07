import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";

export type MD5 = {
    md5: {
        key: any;
    };
};

export default class MD5HandlerBase extends BaseEventHandler<MD5> {
    protected verifyEvent(event: MD5) {
        return !!event.md5;
    }

    protected handle(event: MD5) {
        !!event.md5.key && this.gameData.md5Data.change(event.md5.key);
    }
}
