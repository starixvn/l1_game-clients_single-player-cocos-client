import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaKenoMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteFrame)
    bigDot: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    smallDot: cc.SpriteFrame = null;

    protected readonly betTypes = ["big", "small"];

    public setData(data: any) {
        this.data = data;
        this.icon.spriteFrame = data.settlementResult[this.betTypes[0]] ? this.bigDot : this.smallDot;
    }
}
