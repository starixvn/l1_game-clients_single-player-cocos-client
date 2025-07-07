import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterUpDownMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteFrame)
    upDot: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    downDot: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    balanceDot: cc.SpriteFrame = null;

    public setData(data: any) {
        this.data = data;
        const marginValue = BitcoinMasterUtils.getUpDownResult(data.result);
        if (marginValue === 0) {
            this.icon.spriteFrame = this.balanceDot;
        } else {
            this.icon.spriteFrame = marginValue > 0 ? this.upDot : this.downDot;
        }
    }
}
