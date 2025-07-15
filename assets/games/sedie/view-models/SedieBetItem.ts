import BetItem from "../../_base/view-models/BetItem";

const { ccclass } = cc._decorator;

@ccclass
export default class SedieBetItem extends BetItem {
    public resetHighlight() {
        this.resetHighlightOptions();
    }

    protected setHighlightItems(highlight: boolean, isAnimated = true) {
        this.setHighlightItemsOptions(highlight, isAnimated);
    }
}
