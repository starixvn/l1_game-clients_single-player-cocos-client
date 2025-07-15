import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import GameTicketDetailItemBase from "../../_base/view-models/GameTicketDetailItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FreeBetDetailItem extends GameTicketDetailItemBase {
    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Label)
    value: cc.Label = null;

    setData(betType: string, value: number, index: number) {
        this.label.string = GameUtils.getBetChoiceString(betType);
        this.value.string = numberWithCommas(value);
        this.setBackground(index);
    }
}
