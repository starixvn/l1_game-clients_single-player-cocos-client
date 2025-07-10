import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniRouletteBetHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    amountLabel: cc.Label = null;

    betTime: string = null;
    roundId: number = null;
    result: number = null;
    winning: number = null;
    amount: number = null;
    betLogDetails: any = null;
    settlementResult: any = null;
    odds: Record<string, number> = null;

    public showTicketDetail = (round: number, time: string, result: number, betLogDetails: any, settlementResult: any) => {
        //
    };

    openTicketDetail() {
        this.showTicketDetail(this.roundId, this.betTime, this.result, this.betLogDetails, this.settlementResult);
    }

    setData(log: any, index: number) {
        this.time.string = getStringDateByTime(log.time).replace(" ", "\n");
        this.round.string = log.phien.toString();
    }
}
