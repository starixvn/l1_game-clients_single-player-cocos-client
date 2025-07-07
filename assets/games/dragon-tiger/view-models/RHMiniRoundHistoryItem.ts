import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";
import DragonTigerUtil from "./DragonTigerUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RHMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property({ type: cc.SpriteFrame })
    itemSprites: cc.SpriteFrame[] = [];

    public setData(data: any) {
        this.data = data;

        const winChoice = DragonTigerUtil.getWinItem(data.settlementResult);
        this.icon.spriteFrame = this.itemSprites[winChoice];
    }
}
