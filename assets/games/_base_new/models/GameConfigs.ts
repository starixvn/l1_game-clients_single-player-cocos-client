import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class GameConfigs extends EventEmitterBase {
    static Events = {
        CHANGE: "GameConfigs:CHANGE"
    };

    protected gameConfigs: any;

    change(gameConfigs: any) {
        this.gameConfigs = gameConfigs;
        this.emit(GameConfigs.Events.CHANGE, this.gameConfigs);
    }

    updateUI() {
        this.gameConfigs && this.emit(GameConfigs.Events.CHANGE, this.gameConfigs);
    }
}
