import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class NoticeModel extends EventEmitterBase {
    static Events = {
        CHANGE: "NoticeModel:CHANGE"
    };

    change(notice: any) {
        this.emit(NoticeModel.Events.CHANGE, notice);
    }
}
