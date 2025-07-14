import GameUtils from "../../../../common/GameUtils";
import { getLowercaseObjectKeys } from "../../../../common/helpers/ObjectHelper";
import GameBaseBetHandler from "../../../_base/handlers/GameBaseBetHandler";
import BitcoinMaster from "../BitcoinMaster";

export default class BitCoinMasterBetHandler extends GameBaseBetHandler {
    constructor(protected readonly main: BitcoinMaster) {
        super(main);
    }

    handle(data: any): boolean {
        if (data.totalBets) {
            this.main.totalBets = data.totalBets;

            if (
                this.main.currentTimeRemaining <= this.main.config.betTime &&
                this.main.currentTimeRemaining >= this.main.config.minBetTime
            ) {
                this.main.betItems.forEach((item) => {
                    const totalBetsKeys = getLowercaseObjectKeys(data.totalBets);
                    item.setTotalBet(GameUtils.getValueByCurrency(data.totalBets[totalBetsKeys[item.node.name.toLowerCase()]]));
                });
            }
        }

        if (data.betPercentage) {
            Object.keys(data.betPercentage).forEach((choice) => {
                this.main.showBetPercentage(choice, data.betPercentage[choice]);
            });
        }

        if (this.main.isStopGame || this.main.isDisableGame) {
            return true;
        }

        if (data.ownBets) {
            this.main.betItems.forEach((item) => {
                const ownBetsKeys = getLowercaseObjectKeys(data.ownBets);
                const ownBet = data.ownBets[ownBetsKeys[item.node.name.toLowerCase()]];
                ownBet && item.setOwnBet(ownBet);
            });
        }

        this.handleEndBet(data);

        this.handleChipInMainRoom(data);

        return false;
    }
}
