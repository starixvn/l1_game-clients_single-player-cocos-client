import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property({ type: cc.SpriteFrame })
    iconFrames: cc.SpriteFrame[] = [];

    type = 0;

    public setData(data: any) {
        this.data = data;

        if (this.type === 0) {
            this.icon.spriteFrame = this.data.settlementResult.others.big ? this.iconFrames[0] : this.iconFrames[1];
        } else {
            this.icon.spriteFrame = this.data.settlementResult.others.even ? this.iconFrames[0] : this.iconFrames[1];
        }
    }
}
