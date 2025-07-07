import { numberTo, numberWithCommas } from "../../../common/helpers/NumberHelper";
import BetItem from "./BetItem";

const { ccclass } = cc._decorator;

@ccclass
export default class BalancedBettingPoolBetItem extends BetItem {
    public resetHighlight() {
        this.resetHighlightOptions();
    }

    protected setHighlightItems(highlight: boolean, isAnimated = true) {
        this.setHighlightItemsOptions(highlight, isAnimated);
    }

    public balanceBet(bet: number) {
        numberTo(this.totalBet, bet, 1, true);
    }

    public setTotalBet(bet: number) {
        this.totalBet.string = numberWithCommas(bet, 1);
    }
}
