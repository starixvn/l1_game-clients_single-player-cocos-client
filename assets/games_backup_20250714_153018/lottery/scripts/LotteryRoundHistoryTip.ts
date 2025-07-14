import GameUtils from "../../../common/GameUtils";
import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryRoundHistoryTip extends MiniRoundHistoryTip {
    type = 0;

    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;

        let key = "";
        if (this.type === 0) {
            if (data.settlementResult.others.big) {
                key = `big`;
            } else {
                key = `small`;
            }
        } else {
            if (data.settlementResult.others.even) {
                key = `even`;
            } else {
                key = `odd`;
            }
        }
        const resultString = GameUtils.getBetChoiceString(key).toUpperCase();

        const special = data.result.special[0].slice(-2);
        this.result.string = `${resultString} (${special})`;
    }
}
