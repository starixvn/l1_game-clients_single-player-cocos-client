import { HoldemPokerConfigs } from "../event-models/HoldemPokerConfigs";
import HoldemPokerEventHandler from "./HoldemPokerEventHandler";

export type ConfigsType = {
    gameConfigs: {
        maxBet: number;
        minBet: number;
        odds: any;
        maxBetPerChoices: any;
        chips: any;
    };
};

export default class HoldemPokerGameRoomConfigsHandler extends HoldemPokerEventHandler<ConfigsType> {
    protected verifyEvent(event: ConfigsType) {
        return event.gameConfigs != null;
    }

    protected handle(event: ConfigsType) {
        const configs = this.transformToGameConfigs(event);
        this.gameData.configs.change(configs);
    }

    private transformToGameConfigs(event: ConfigsType): HoldemPokerConfigs {
        const { maxBet, minBet, odds, maxBetPerChoices, chips } = event.gameConfigs;

        return Object.assign(
            {},
            this.gameData.configs,
            {
                maxBet,
                minBet,
                odds,
                chips,
                maxBetPerChoices
            },
            maxBetPerChoices && {
                maxBetChoices: { ...maxBetPerChoices }
            }
        );
    }
}
