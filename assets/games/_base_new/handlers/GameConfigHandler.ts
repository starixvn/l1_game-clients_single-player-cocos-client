import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

export type ConfigsType = {
    gameConfigs: any;
};

export class GameConfigHandler extends BaseEventHandler<ConfigsType> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: ConfigsType) {
        return event.gameConfigs != null;
    }

    protected handle(event: ConfigsType) {
        this.gameData.gameConfigs.change(event.gameConfigs);
        this.gameData.boostedChoicesModel.change(event.gameConfigs.boostedChoices);
    }
}
