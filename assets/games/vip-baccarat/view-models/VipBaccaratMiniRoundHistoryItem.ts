import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VipBaccaratMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Sprite)
    banker: cc.Sprite = null;

    @property(cc.Sprite)
    player: cc.Sprite = null;

    @property(cc.Sprite)
    tie: cc.Sprite = null;

    @property(cc.Node)
    playerPair: cc.Node = null;

    @property(cc.Node)
    bankerPair: cc.Node = null;

    public setData(data: any) {
        this.data = data;
        const result = data.result;
        if (result.tie) {
            this.icon.spriteFrame = this.tie.spriteFrame;
        } else {
            this.icon.spriteFrame = result.banker ? this.banker.spriteFrame : this.player.spriteFrame;
        }

        this.playerPair.active = result.playerPair;
        this.bankerPair.active = result.bankerPair;
    }
}
