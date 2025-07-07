import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

export type BetDetailsEvent = {
    betDetailsUrl: any;
};

export class BetDetailsUrlHandler extends BaseEventHandler<BetDetailsEvent> {
    protected readonly gameData: NewGameData;

    protected verifyEvent(event: BetDetailsEvent) {
        return event.betDetailsUrl != null;
    }

    protected handle(event: BetDetailsEvent) {
        this.gameData.betDetailsUrl.change(event.betDetailsUrl);
    }
}
