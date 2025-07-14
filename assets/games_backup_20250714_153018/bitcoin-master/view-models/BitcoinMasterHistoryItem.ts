import AudioManager from "../../../common/audio/AudioManager";
import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";
import { BMBetType, BMHeaderMenu } from "./BitcoinMasterCommon";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    totalBet: cc.Label = null;

    @property(cc.Label)
    refund: cc.Label = null;

    @property(cc.Node)
    background: cc.Node = null;

    @property(cc.Node)
    bottomLine: cc.Node = null;

    public showTicketDetail = (data: any) => {};
    public showBetHistory = (roundId, view) => {};

    protected data: any;
    protected roundID: number;
    protected view = BMHeaderMenu.UpDown;

    openTicketDetail() {
        AudioManager.getInstance().playClick();
        this.showTicketDetail(this.data);
    }

    openBetHistory() {
        AudioManager.getInstance().playClick();
        this.showBetHistory(this.roundID, this.view);
    }

    setData(data: any, index: number) {
        this.data = data;
        this.roundID = data.phien;
        this.background.active = index % 2 !== 0;
        this.time.string = getStringDateByTime(data.time);
        this.round.string = data.phien.toString();
        this.win.string = numberWithCommas(BitcoinMasterUtils.setGrossWinLoss(data), 2);
        this.totalBet.string = numberWithCommas(data.totalAmount);
        this.refund.string = numberWithCommas(data.refund, 2);

        if (data[BMBetType.Up] > 0 || data[BMBetType.Down] > 0) {
            this.view = BMHeaderMenu.UpDown;
        } else {
            this.view = BMHeaderMenu.EvenOdd;
        }
    }
}
