import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Sprite)
    dices: cc.Sprite[] = [];

    @property(cc.Label)
    total: cc.Label = null;

    @property(cc.Label)
    amountLabel: cc.Label = null;

    timeBet: string = null;
    roundId: number = null;
    result: object = {};
    winning: number = null;
    amount: number = null;
    betLogDetails: any = null;
    settlementResult: any = null;

    public showTicketDetail = (round: number, time: string, result: any, betLogDetails: any, settlementResult: any) => {};

    openTicketDetail() {
        this.showTicketDetail(this.roundId, this.timeBet, this.result, this.betLogDetails, this.settlementResult);
    }

    setData(betLog: any, dicesSpriteFrames: cc.SpriteFrame[], index: number) {
        this.time.string = getStringDateByTime(betLog.time);
        this.round.string = betLog.phien.toString();
        this.dices[0].spriteFrame = dicesSpriteFrames[betLog.result.dice1 - 1];
        this.dices[1].spriteFrame = dicesSpriteFrames[betLog.result.dice2 - 1];
        this.dices[2].spriteFrame = dicesSpriteFrames[betLog.result.dice3 - 1];
        this.total.string = betLog.result.dice1 + betLog.result.dice2 + betLog.result.dice3;
        this.setBackground(index);
    }
}
