import BetItem from "../../_base/view-models/BetItem";

const { ccclass } = cc._decorator;

@ccclass
export default class BaccaratBetItem extends BetItem {
    public resetHighlight() {
        this.highlight.active = false;
        if (this.highlightBackground) {
            this.highlightBackground.active = false;
        }
    }
}
