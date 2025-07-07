import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

export type OddsType = {
    odds: any;
};

export class OddsHandler extends BaseEventHandler<OddsType> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: OddsType) {
        return event.odds != null;
    }

    protected handle(event: OddsType) {
        this.gameData.boostedChoicesModel.change(event.odds.boostedChoices);
        this.gameData.boostedOddsModel.change(event.odds.values);
    }
}
