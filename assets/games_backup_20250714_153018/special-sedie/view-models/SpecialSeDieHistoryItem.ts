import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SedieHistoryItemBase from "../../_base/view-models/SedieHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpecialSeDieHistoryItem extends SedieHistoryItemBase {
    @property(cc.Label)
    option: cc.Label = null;

    @property(cc.Label)
    bet: cc.Label = null;

    @property(cc.Label)
    refund: cc.Label = null;

    roundId = 0;

    public handleRoundIdClick = (roundId: number) => {};

    openBetHistory() {
        this.handleRoundIdClick(this.roundId);
    }

    setData(betLog: any) {
        const { phien, choice, amount, refund, win } = betLog;

        this.option.string = GameUtils.getBetChoiceString(choice);
        this.option.node.color = win ? cc.Color.YELLOW : cc.Color.WHITE;
        this.bet.string = numberWithCommas(amount);
        this.refund.string = numberWithCommas(refund, 2);
        this.roundId = phien;
    }
}
