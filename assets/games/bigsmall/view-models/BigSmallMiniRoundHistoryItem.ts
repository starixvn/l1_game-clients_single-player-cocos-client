import MiniRoundHistoryItem from '../../../common/mini-round-history/MiniRoundHistoryItem';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BigSmallMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteFrame)
    whiteDot: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    blackDot: cc.SpriteFrame = null;

    protected readonly betTypes = ["big", "small"];

    public setData(data: any) {
        this.data = data;
        this.icon.spriteFrame = data.settlementResult[this.betTypes[0]] ? this.blackDot : this.whiteDot;
    }
}
