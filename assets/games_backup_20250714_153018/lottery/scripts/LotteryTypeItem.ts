import { formatOdds } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryTypeItem extends cc.Component {
    @property(cc.Label)
    odds: cc.Label = null;

    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    onLoad() {
        this.odds.node.active = false;
    }

    updateLabelColor() {
        this.odds.node.parent.color = this.toggle.isChecked ? cc.Color.WHITE : cc.color(141, 153, 172, 255);
    }

    setOdds(value: string) {
        this.odds.node.active = true;
        this.odds.string = formatOdds(value);
    }
}
