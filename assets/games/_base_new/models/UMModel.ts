import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class UMModel extends EventEmitterBase {
    static Events = {
        ON_UM: "UMModel:ON_UM",
        CHECK_OFF_UM: "UMModel:CHECK_OFF_UM"
    };

    protected currentUMData: any;

    onUM(data: any) {
        this.currentUMData = data;
        this.emit(UMModel.Events.ON_UM, this.currentUMData);
    }

    checkToOffUM(data: any) {
        this.emit(UMModel.Events.CHECK_OFF_UM, data);
    }

    clearUM() {
        this.currentUMData = null;
    }

    updateUI() {
        this.currentUMData && this.emit(UMModel.Events.ON_UM, this.currentUMData);
    }
}
