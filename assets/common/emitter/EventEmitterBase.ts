import { EventEmitter } from "events";

export default class EventEmitterBase extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(0);
    }

    updateUI() {}
}
