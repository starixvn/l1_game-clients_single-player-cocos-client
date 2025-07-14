import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";
import { BetLog } from "./HiLoBetData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoTicketHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    stake: cc.Label = null;

    renderTicketItem(item: BetLog, index: number) {
        this.time.string = getStringDateByTime(item.time);
        this.round.string = item.id.toString();
        this.stake.string = numberWithCommas(item.amount, 2);
        this.win.string = numberWithCommas(item.betwin, 2);
        if (item.betwin > item.amount) {
            this.stake.node.color = cc.Color.YELLOW;
        }
        this.setBackground(index);
    }

    openTicketDetail() {}
}
