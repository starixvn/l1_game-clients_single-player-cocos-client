import GameUtils from "../../../common/GameUtils";
import JackpotPoolItem from "./JackpotPoolItem";

const { ccclass } = cc._decorator;

@ccclass
export default class StandardJackpotPoolItem extends JackpotPoolItem {
    calculateJackpotPool(amount: number) {
        return GameUtils.getValueByCurrency(amount);
    }

    setHighlight(highlight: boolean) {
        if (this.highlight) {
            this.highlight.active = highlight;
            if (highlight) {
                cc.tween(this.highlight.parent).to(0.15, { scale: 1 }, { easing: "sineOut" }).start();
            } else {
                cc.tween(this.highlight.parent).to(0.075, { scale: 0.84 }, { easing: "sineIn" }).start();
            }
        }
    }
}
