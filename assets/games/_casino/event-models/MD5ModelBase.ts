import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class MD5ModelBase extends EventEmitterBase {
    static Events = {
        CHANGE: "md5:change"
    };

    md5: any;

    change(data: any) {
        this.md5 = data;
        this.emit(MD5ModelBase.Events.CHANGE, this);
    }
}
