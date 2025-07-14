import HiLoEventHandler from "./HiLoEventHandler";

export type ConfigsType = {
    gameConfigs: {
        maxBet: number;
        minBet: number;
        chips: any;
    };
};

export class HiLoGameConfigsHandler extends HiLoEventHandler<ConfigsType> {
    protected verifyEvent(data: ConfigsType) {
        return data.gameConfigs != null;
    }

    protected handle(data: ConfigsType) {
        this.gameData.configs.change(data.gameConfigs);
    }
}
