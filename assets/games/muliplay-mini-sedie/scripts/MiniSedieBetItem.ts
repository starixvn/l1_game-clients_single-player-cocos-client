import BetItem from "../../_base/view-models/BetItem";

const { ccclass } = cc._decorator;

@ccclass
export default class MiniSedieBetItem extends BetItem {
    public setHighlight(highlight: boolean, isAnimated = true) {
        super.setHighlight(highlight, isAnimated);

        if (this.highlightBorder) {
            this.highlightBorder.active = highlight && !isAnimated;
        }
    }
}
