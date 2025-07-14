import GameUtils from "../../../common/GameUtils";
import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import HistoryDicesResult from "../../_base/view-models/HistoryDicesResult";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BigSmallHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Node)
    result: cc.Node = null;

    @property(cc.Prefab)
    resultPrefab: cc.Prefab = null;

    @property(cc.Label)
    bet: cc.Label = null;

    @property(cc.Label)
    refund: cc.Label = null;

    roundId = 0;

    public handleRoundIdClick = (roundId: number) => {};

    openBetHistory() {
        this.handleRoundIdClick(this.roundId);
    }

    setData(betLog: any, index: number) {
        const { time, phien, betwin, amount, refund, win, choice } = betLog;
        this.time.string = getStringDateByTime(time);
        this.round.string = phien;
        this.bet.string = numberWithCommas(amount);
        this.refund.string = numberWithCommas(refund, 2);
        this.roundId = phien;
        this.win.string = numberWithCommas(betwin, 2);
        this.choice.string = GameUtils.getBetChoiceString(choice);
        this.setResultData(betLog);
        this.setBackground(index);

        if (win) {
            this.time.node.color = cc.Color.YELLOW;
            this.choice.node.color = cc.Color.YELLOW;
        } else {
            this.time.node.color = cc.Color.WHITE;
            this.choice.node.color = cc.Color.WHITE;
        }
    }

    setResultData(data: any) {
        const { result, settlementResult } = data;
        const resultNode = GameUtils.createNodeFromPrefab(this.resultPrefab);
        if (resultNode) {
            const resultControl = resultNode.getComponent(HistoryDicesResult);
            resultControl.setResult(result, settlementResult);
            this.result.addChild(resultNode);
        }
    }
}
