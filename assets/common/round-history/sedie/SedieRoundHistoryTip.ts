import GameUtils from "../../../common/GameUtils";
import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieRoundHistoryTip extends MiniRoundHistoryTip {
    @property(cc.Label)
    red: cc.Label = null;

    @property(cc.Label)
    white: cc.Label = null;

    public setData(data: any) {
        const red = data.red;
        this.roundId.string = `#${data.roundId}`;
        const key = red % 2 === 0 ? "even" : "odd";
        this.result.string = GameUtils.getBetChoiceString(key).toUpperCase();
        this.red.string = red.toString();
        this.white.string = (4 - red).toString();
        this.show();
    }
}
