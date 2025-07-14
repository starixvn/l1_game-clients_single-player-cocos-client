import GameBalancedBettingHistoryBase from "../../_base/view-models/GameBalancedBettingHistoryBase";
import { getStringDateByTime } from "./../../../common/helpers/DateTimeHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SpecialSedieBetHistory extends GameBalancedBettingHistoryBase {
    @property(cc.Node)
    dots: cc.Node = null;

    @property(cc.SpriteFrame)
    redDot: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    whiteDot: cc.SpriteFrame = null;

    protected betType = ["even", "odd"];

    HEIGHT_BET_DETAIL_TABLE = 430;
    WIDTH_BET_DETAIL_TABLE = 560;

    onData(data: any) {
        super.onData(data);
        this.loadBettingUserList(this.betType[0], this.betType[1]);
        const { id, time, result } = data;
        this.roundIdLabel.string = `${id} - ${getStringDateByTime(time)}`;
        this.updateDotsResult(result);
    }

    updateDotsResult(result: any) {
        const totalRed = Object.values(result).filter((value) => value === true).length;
        const resultChips = this.getResultChips(totalRed);
        Object.keys(resultChips).forEach((key, index) => {
            const dot = this.dots.children[index]?.getComponent(cc.Sprite);
            dot.spriteFrame = resultChips[key] ? this.redDot : this.whiteDot;
        });
    }

    getResultChips(totalRed: number) {
        const chips = {
            0: { red1: false, red2: false, red3: false, red4: false },
            1: { red1: true, red2: false, red3: false, red4: false },
            2: { red1: true, red2: true, red3: false, red4: false },
            3: { red1: true, red2: true, red3: true, red4: false },
            4: { red1: true, red2: true, red3: true, red4: true }
        };

        return chips.hasOwnProperty(totalRed) ? chips[totalRed] : chips[4];
    }
}
