import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import GameBaseBetHandler from "../../../_base/handlers/GameBaseBetHandler";
import Lottery from "../Lottery";

export default class LotteryBetHandler extends GameBaseBetHandler {
    constructor(protected readonly main: Lottery) {
        super(main);
    }

    handle(data: any): boolean {
        super.handle(data);

        if (data.ownBets) {
            this.main.ownBets = data.ownBets;
        }

        if (data.ownChip) {
            this.placeOwnChip(data.ownChip);
        }

        if (data.chips) {
            this.updateOwnBetDisplay();
        }

        if (data.stats) {
            this.main.stats = data.stats;
            this.main.updateDisplayStats();
        }

        return false;
    }

    placeOwnChip(data: any) {
        const { betChoice } = data;
        Object.keys(betChoice).forEach((choiceType) => {
            const choiceInfo = betChoice[choiceType];
            Object.keys(choiceInfo).forEach((choiceName) => {
                this.main.placeChipOnBoard(choiceInfo[choiceName], choiceType, choiceName, () => {
                    this.updateOwnBetDisplay();
                });
            });
        });
    }

    updateOwnBetDisplay() {
        this.main.totalBet.string = numberWithCommas(this.main.ownBets.totalAmount);
        this.main.updateDisplayOwnBets();
    }
}
