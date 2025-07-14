import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";
import { SicBoBetType } from "./SicBoCommon";
const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class SicBoRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    points: cc.Label = null;

    @property(cc.SpriteFrame)
    circle: cc.SpriteFrame = null;

    public data: any = {};

    public setData(data: any) {
        this.data = data;
        const color = cc.Color.BLACK;

        if (this.data.settlementResult[SicBoBetType.anyTriple]) {
            color.fromHEX("#f29f00");
        } else {
            if (this.data.settlementResult[SicBoBetType.big]) {
                color.fromHEX("#db1515");
            } else {
                color.fromHEX("#2580f1");
            }
        }

        this.icon.spriteFrame = this.circle;
        this.icon.node.color = color;

        const totalPoint = this.data.result.dice1 + this.data.result.dice2 + this.data.result.dice3;

        this.points.string = totalPoint.toString();
    }
}
