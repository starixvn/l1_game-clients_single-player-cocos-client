import AudioManager from "../../common/audio/AudioManager";
import { getStringDateByTime } from "./../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "./../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGameHistoryItem extends cc.Component {
    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    roundID: cc.Label = null;

    @property(cc.Label)
    bet: cc.Label = null;

    @property(cc.Label)
    payLines: cc.Label = null;

    @property(cc.Label)
    totalAmount: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    @property(cc.Node)
    jackpotIcon: cc.Node = null;

    @property
    textHighlightColor: cc.Color = cc.Color.YELLOW;

    @property
    textNormalColor: cc.Color = cc.Color.WHITE;

    @property
    enableHighlightBg = false;

    @property({
        visible: function (this: SlotGameHistoryItem) {
            return this.enableHighlightBg;
        }
    })
    bgHighlightColor: cc.Color = cc.Color.WHITE;

    data: any = null;

    public showTicketDetail = (data: any) => {
        // do nohting
    };

    openTicketDetail() {
        AudioManager.getInstance().playClick();
        this.showTicketDetail(this.data);
    }

    setData(betLog, index, gameId) {
        const { betWin, settlementResult, time, id, paylines, bet, totalAmount } = betLog;
        let win = betWin;
        if (settlementResult.jackpot) {
            win += settlementResult.jackpot.winningAmount;
        }

        this.node.active = true;
        this.bg.active = index % 2 > 0;
        this.time.string = getStringDateByTime(time);
        this.roundID.string = id;
        this.payLines.string = paylines.length;
        this.bet.string = numberWithCommas(bet, 2);
        this.totalAmount.string = betLog.freeSpin ? "0" : numberWithCommas(totalAmount, 2);
        this.win.string = numberWithCommas(win, 2);
        this.data = betLog;

        const highlight = win > 0;
        const highlightColor = highlight ? this.textHighlightColor : this.textNormalColor;
        this.time.node.color = highlightColor;
        this.payLines.node.color = highlightColor;
        this.bet.node.color = highlightColor;
        if (this.enableHighlightBg && highlight) {
            this.bg.active = true;
            this.bg.color = this.bgHighlightColor;
        }

        this.showJackpotIcon(settlementResult.jackpot);
    }

    protected showJackpotIcon(jackpot) {
        if (jackpot && this.jackpotIcon) {
            this.jackpotIcon.active = true;
        }
    }
}
