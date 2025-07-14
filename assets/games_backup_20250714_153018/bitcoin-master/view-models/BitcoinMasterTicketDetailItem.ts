import GameUtils from "../../../common/GameUtils";
import { getStringHourByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";
import { BMBetType } from "./BitcoinMasterCommon";
import BitcoinMasterEvenOddResultDetail from "./BitcoinMasterEvenOddResultDetail";
import BitcoinMasterUpDownResultDetail from "./BitcoinMasterUpDownResultDetail";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterTicketDetailItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    choice: cc.Label = null;

    @property(BitcoinMasterUpDownResultDetail)
    upDownResult: BitcoinMasterUpDownResultDetail = null;

    @property(BitcoinMasterEvenOddResultDetail)
    evenOddResult: BitcoinMasterEvenOddResultDetail = null;

    @property(cc.Label)
    bet: cc.Label = null;

    @property(cc.Label)
    refund: cc.Label = null;

    setData(log: any, result: any, index: number) {
        const { time, choice, amount, refund, win } = log;
        this.time.string = getStringHourByTime(time);
        this.choice.string = GameUtils.getBetChoiceString(choice);
        this.bet.string = numberWithCommas(amount);
        this.refund.string = numberWithCommas(refund, 2);
        this.win.string = numberWithCommas(BitcoinMasterUtils.calcGrossWinLoss(log), 2);
        if (win) {
            this.choice.node.color = cc.Color.YELLOW;
            this.bet.node.color = cc.Color.YELLOW;
            this.refund.node.color = cc.Color.YELLOW;
        }
        switch (log.choice) {
            case BMBetType.Up:
            case BMBetType.Down:
                this.upDownResult.setData(result);
                this.evenOddResult.node.active = false;
                break;
            default:
                this.upDownResult.node.active = false;
                this.evenOddResult.setData(result.close);
        }
        this.setBackground(index);
    }
}
