import { injectable } from "inversify";

import { ICashSystem, ICreditSystem, System } from "../../../System";

@injectable()
export default class OldMiniGameConfig extends System implements ICreditSystem, ICashSystem {
    constructor() {
        super();
    }

    gameConfigs: any;
    dragonTigerChoicesMaxbet: any;

    customizeCredit(): void {
        this.gameConfigs = {
            minBet: 1,
            maxBet: 2000,
            maxBetPerChoices: {},
            odds: {
                even: 1.96
            }
        };

        this.dragonTigerChoicesMaxbet = {
            dragon: 2000,
            tie: 500
        };
    }

    customizeCash(): void {
        this.gameConfigs = {
            minBet: 10,
            maxBet: 20000,
            maxBetPerChoices: {},
            odds: {
                even: 1.96
            }
        };

        this.dragonTigerChoicesMaxbet = {
            dragon: 20000,
            tie: 2000
        };
    }
}
