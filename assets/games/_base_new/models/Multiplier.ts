import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { MultiplierEvent } from "../handlers/MultiplierHandler";

export class Multiplier extends EventEmitterBase {
    static Events = {
        CHANGE: "Multiplier:CHANGE"
    };

    change(multiplier: MultiplierEvent) {
        this.emit(Multiplier.Events.CHANGE, multiplier);
    }
}
