import GameUtils from "../../../../common/GameUtils";
import { formatDateTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaKenoHistoryDetailItem extends cc.Component {
    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Label)
    amount: cc.Label = null;

    setData(betLog: any) {
        this.time.string = formatDateTime(betLog.time);
        this.choice.string = GameUtils.getBetChoiceString(betLog.choice).toUpperCase();
        this.amount.string = numberWithCommas(betLog.amount);
    }
}
