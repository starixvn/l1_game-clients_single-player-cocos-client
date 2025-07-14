import FadeAppearanceNode from "../../../common/FadeAppearanceNode";
import GameUtils from "../../../common/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TotalMultiplierView extends FadeAppearanceNode {
    @property(cc.Label)
    total: cc.Label = null;

    onLoad() {
        this.showView(false, true);
    }

    setValue(value: number, animated: boolean) {
        if (animated) {
            GameUtils.floatToNumber({ label: this.total, amount: value, duration: 0.2, noZeroSuffix: true, prefixStr: "x" });
        } else {
            this.total.string = value > 0 ? `x${value}` : "";
        }
    }
}
