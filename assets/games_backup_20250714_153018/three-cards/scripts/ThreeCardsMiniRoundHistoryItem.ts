import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeCardsMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    dot: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    public setData(data: any) {
        this.data = data;
        if (data.result) {
            this.dot.spriteFrame = this.atlas && this.atlas.getSpriteFrame(`dot_red`);
        } else {
            this.dot.spriteFrame = this.atlas && this.atlas.getSpriteFrame(`dot_black`);
        }
    }
}
