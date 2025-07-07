import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingSlotTotalMultiplierItem extends cc.Component {
    @property(cc.Label)
    index: cc.Label = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    roundId: cc.Label = null;

    @property(cc.Label)
    multiplier: cc.Label = null;

    @property(cc.Label)
    totalMultiplier: cc.Label = null;

    @property(cc.Node)
    bg: cc.Node = null;

    setData(round: any, index: number) {
        const { time, roundId, totalMultiplier, multiplier } = round;
        this.index.string = index.toString();
        this.time.string = getStringDateByTime(time);
        this.roundId.string = roundId;
        this.multiplier.string = multiplier;
        this.totalMultiplier.string = totalMultiplier;
        this.bg.active = index % 2 === 0;
    }
}
