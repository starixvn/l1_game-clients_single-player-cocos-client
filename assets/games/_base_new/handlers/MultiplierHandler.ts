import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

export type MultiplierEvent = {
    multiplier: any;
};

export class MultiplierHandler extends BaseEventHandler<MultiplierEvent> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: MultiplierEvent) {
        return event.multiplier != null;
    }

    protected handle(event: MultiplierEvent) {
        this.gameData.multiplier.change(event.multiplier);
    }
}
