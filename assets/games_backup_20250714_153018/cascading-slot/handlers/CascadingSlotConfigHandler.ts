import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import { CascadingSlotConfigData } from "../models/CascadingSlotConfigModel";
import CascadingSlotGameData from "../models/CascadingSlotGameData";

export type ConfigsType = {
    gameConfigs: CascadingSlotConfigData;
};

export default class CascadingSlotConfigHandler extends BaseEventHandler<ConfigsType> {
    protected readonly gameData: CascadingSlotGameData;

    protected verifyEvent(data: ConfigsType) {
        return !!data.gameConfigs;
    }

    protected handle(event: ConfigsType) {
        const configs: CascadingSlotConfigData = event.gameConfigs;
        this.gameData.gameConfig.change(configs);
    }
}
