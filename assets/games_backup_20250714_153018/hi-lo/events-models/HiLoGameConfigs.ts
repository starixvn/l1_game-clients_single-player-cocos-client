import { EventEmitter } from "events";

export default class HiLoGameConfigs extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(0);
    }

    static Events = {
        CHANGE: "configs:change"
    };

    gameConfigs: any;

    change(configs: any) {
        this.gameConfigs = configs;

        this.emit(HiLoGameConfigs.Events.CHANGE, this);
    }
}
