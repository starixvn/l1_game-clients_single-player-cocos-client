import { getStringDateByTime } from "./../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "./../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingSlotHistoryItem extends cc.Component {
    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    roundID: cc.Label = null;

    @property(cc.Label)
    betLevel: cc.Label = null;

    @property(cc.Label)
    coinValue: cc.Label = null;

    @property(cc.Label)
    totalBet: cc.Label = null;

    @property(cc.Label)
    totalWin: cc.Label = null;

    data: any = null;

    setData(betLog, index) {
        const win = betLog.betwin;
        this.node.active = true;
        this.bg.active = index % 2 > 0;
        this.time.string = getStringDateByTime(betLog.time);
        this.roundID.string = betLog.id;
        this.betLevel.string = betLog.betLevel;
        this.coinValue.string = betLog.coinValue;
        this.totalBet.string = betLog.freeSpin ? "0" : numberWithCommas(betLog.totalAmount, 2);
        this.totalWin.string = numberWithCommas(win, 2, false);
        this.data = betLog;
    }

    public showTicketDetail = (data: any) => {};

    openTicketDetail() {
        this.showTicketDetail(this.data);
    }
}
