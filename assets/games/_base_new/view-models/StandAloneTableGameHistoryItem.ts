import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandAloneTableGameHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    stake: cc.Label = null;

    data: any = null;

    setData(data: any, index: number) {
        const { time, roundId, result, betwin, settlementResult } = data;
        this.time.string = getStringDateByTime(time);
        this.round.string = roundId;
        this.stake.string = numberWithCommas(this.handleStake(settlementResult, data));
        this.win.string = numberWithCommas(betwin, 2);
        this.handleResult(result);
        this.handleStake(settlementResult, data);
        this.data = data;
        this.setBackground(index);
    }

    handleStake(settlementResult: any, data: any) {
        let stake = 0;
        Object.keys(settlementResult).forEach((choice) => {
            stake += data[choice];
        });
        return stake;
    }

    handleResult(result: any) {}

    public showTicketDetail = (data: any) => {};

    openTicketDetail() {
        this.showTicketDetail(this.data);
    }
}
