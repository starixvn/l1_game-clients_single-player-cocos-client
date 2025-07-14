import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class HoldemPokerConfigs extends EventEmitterBase {
    static Events = {
        CHANGE: "configs:change"
    };

    maxBet: number;
    minBet: number;
    maxBetChoices: Record<string, number>;
    odds: Record<string, number>;
    chips: number[];

    change(configs: HoldemPokerConfigs) {
        const { maxBet, minBet, odds, maxBetChoices, chips } = configs;

        this.maxBet = maxBet || this.maxBet;
        this.minBet = minBet || this.minBet;
        this.odds = odds || this.odds;
        this.maxBetChoices = maxBetChoices || this.maxBetChoices;
        this.chips = chips || this.chips;

        this.emit(HoldemPokerConfigs.Events.CHANGE, configs);
    }
}
