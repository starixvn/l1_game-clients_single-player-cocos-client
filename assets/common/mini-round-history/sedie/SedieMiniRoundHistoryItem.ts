import MiniRoundHistoryItem from "../MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteFrame)
    dotRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    dotWhite: cc.SpriteFrame = null;

    public setData(data: any) {
        this.data = data;
        const red = data.red;
        this.icon.spriteFrame = red % 2 === 0 ? this.dotWhite : this.dotRed;
    }
}
