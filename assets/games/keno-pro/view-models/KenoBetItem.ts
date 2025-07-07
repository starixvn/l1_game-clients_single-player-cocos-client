import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import BetItem from "../../_base/view-models/BetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KenoBetItem extends BetItem {
    @property(cc.Node)
    inActive: cc.Node = null;

    public setOwnBet(bet: number) {
        this.ownBet.string = bet > 0 ? numberWithCommas(bet) : "";
    }

    public setHighlight(highlight: boolean, isAnimated = true) {
        super.setHighlight(highlight, isAnimated);
        this.inActive.active = !highlight && isAnimated;
    }

    public resetHighlight() {
        this.inActive.active = false;
        this.highlight.active = false;
    }
}
