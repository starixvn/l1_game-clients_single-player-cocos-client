import BaccaratBetItem from "../../baccarat/view-models/BaccaratBetItem";

const { ccclass } = cc._decorator;

@ccclass
export default class VipBaccaratBetItem extends BaccaratBetItem {
    protected setHighlightItems(highlight: boolean, isAnimated = true) {
        this.highlight.active = highlight && isAnimated;
        if (this.highlightBackground) {
            this.highlightBackground.active = highlight && isAnimated;
        }
        if (this.highlightBorder) {
            this.highlightBorder.active = highlight && !isAnimated;
        }
        if (this.normalBorder) {
            this.normalBorder.active = true;
        }
    }
}
