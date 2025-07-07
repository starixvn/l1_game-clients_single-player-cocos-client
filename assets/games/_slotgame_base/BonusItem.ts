import { numberWithCommas } from "../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BonusItem extends cc.Component {
    @property(cc.Animation)
    openChestAnimation: cc.Animation = null;

    @property(cc.Label)
    value: cc.Label = null;

    onLoad() {}

    open(value: number) {
        this.openChestAnimation && this.openChestAnimation.play();

        if (value > 0) {
            this.value.string = numberWithCommas(value);
        }
    }
}
