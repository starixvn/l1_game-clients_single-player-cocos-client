import GameBalancedBettingHistoryBase from "../../_base/view-models/GameBalancedBettingHistoryBase";
import { getStringDateByTime } from "./../../../common/helpers/DateTimeHelper";
import BigSmall from "./BigSmall";

const { ccclass, property } = cc._decorator;
@ccclass
export default class BigSmallBetHistory extends GameBalancedBettingHistoryBase {
    @property(cc.Sprite)
    dices: cc.Sprite[] = [];

    @property(cc.SpriteFrame)
    diceFrames: cc.SpriteFrame[] = [];

    protected main: BigSmall;
    protected roundId = 0;

    HEIGHT_BET_DETAIL_TABLE = 430;
    WIDTH_BET_DETAIL_TABLE = 560;

    init(main: BigSmall, roundId: number) {
        super.init(main, roundId);
    }

    onData(data: any) {
        super.onData(data);
        this.loadBettingUserList(this.main.choices[1], this.main.choices[0]);
        const { id, time, result } = data;
        this.roundIdLabel.string = `${id} - ${getStringDateByTime(time)}`;
        this.updateDotsResult(result);
    }

    updateDotsResult(result: any) {
        Object.keys(result).forEach((key, index) => {
            const dot = this.dices[index].getComponent(cc.Sprite);
            dot.spriteFrame = this.diceFrames[result[key] - 1];
        });
    }
}
