import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import BetItem from "../../_base/view-models/BetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoBetItem extends BetItem {
    setTotalBet(bet: number) {
        if (this.totalBet) {
            this.totalBet.string = bet > 0 ? numberWithCommas(bet, 1) : "";
        }
    }

    protected setHighlightItems(highlight: boolean, isAnimated = true) {
        super.setHighlightItems(highlight, isAnimated);
        if (this.highlightBorder) {
            this.highlightBorder.active = highlight && !isAnimated;
        }
    }
}
