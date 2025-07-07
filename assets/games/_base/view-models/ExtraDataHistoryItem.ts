import BlinkNode from "../../../common/BlinkNode";
import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExtraDataHistoryItem extends MiniRoundHistoryItem {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Sprite)
    extraInfo: cc.Sprite = null;

    choiceSpriteName = {
        0: "big-icon",
        1: "small-icon"
    };

    prefixSpriteName = "big_small_num_";

    public setData(data: any) {
        if (data === null) {
            this.icon.spriteFrame = this.atlas.getSpriteFrame("pending-icon");
            this.extraInfo && (this.extraInfo.spriteFrame = null);
            this.icon.addComponent(BlinkNode).interval = 0.5;
            return;
        }

        const { type, extra } = data;
        this.icon.spriteFrame = this.atlas.getSpriteFrame(this.choiceSpriteName[type]);
        this.extraInfo && (this.extraInfo.spriteFrame = this.atlas.getSpriteFrame(`${this.prefixSpriteName}${extra.sum}`));
    }
}
