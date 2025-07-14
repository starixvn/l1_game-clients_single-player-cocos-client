import HoldemPokerGameRoomConfigsHandler from "../../holdem-poker/event-handlers/HoldemPokerConfigsHandler";

export type ConfigsType = {
    gameConfigs: {
        maxBet: number;
        minBet: number;
        odds: any;
        maxBetPerChoices: any;
        chips: any;
    };
};

export default class TexasConfigsHandler extends HoldemPokerGameRoomConfigsHandler {}
