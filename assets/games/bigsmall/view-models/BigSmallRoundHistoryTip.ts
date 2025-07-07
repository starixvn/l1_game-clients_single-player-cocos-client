import GameUtils from "../../../common/GameUtils";
import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";

const { ccclass } = cc._decorator;

@ccclass
export default class BigSmallRoundHistoryTip extends MiniRoundHistoryTip {
    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;
        const key = Object.keys(data.settlementResult).find((key) => data.settlementResult[key]);
        const message = GameUtils.getBetChoiceString(key).toUpperCase();
        this.result.string = `${message} (${data.result.dice1}-${data.result.dice2}-${data.result.dice3})`;
    }
}
