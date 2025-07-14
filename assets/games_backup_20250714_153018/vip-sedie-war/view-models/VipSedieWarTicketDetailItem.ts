import { getStringHourByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import GameTicketDetailItemBase from "../../_base/view-models/GameTicketDetailItemBase";
import VipSedieWarUtils from "./VipSedieWarUtils";

const { ccclass, property } = cc._decorator;
@ccclass
export default class VipSedieWarTicketDetailItem extends GameTicketDetailItemBase {
    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Label)
    amount: cc.Label = null;

    setData(data: any, index: number) {
        this.choice.string = VipSedieWarUtils.getBetChoiceString(data.choice);
        this.amount.string = numberWithCommas(data.amount);
        this.time.string = getStringHourByTime(data.time);
        this.setBackground(index);
    }

    setHighlightWinChoice(highlight: boolean) {
        const color = highlight ? cc.Color.WHITE.fromHEX("#FFE800") : cc.Color.WHITE;
        this.amount.node.color = color;
        this.choice.node.color = color;
    }
}
