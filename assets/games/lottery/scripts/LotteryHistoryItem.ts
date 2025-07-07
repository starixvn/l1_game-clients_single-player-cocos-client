import AudioManager from "../../../common/audio/AudioManager";
import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

interface Data {
    phien: number;
    time: string;
    totalAmount: number;
    betwin: number;
    betLogDetails: any;
}

@ccclass
export default class LotteryHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    totalBet: cc.Label = null;

    public showTicketDetail = (data: any) => {};
    protected data: any;

    openTicketDetail() {
        AudioManager.getInstance().playClick();
        this.showTicketDetail(this.data);
    }

    setData(data: Data, index: number) {
        this.data = data;

        this.setBackground(index);
        this.time.string = getStringDateByTime(data.time);
        this.round.string = data.phien.toString();
        this.win.string = numberWithCommas(data.betwin, 2);
        this.totalBet.string = numberWithCommas(data.totalAmount);
    }
}
