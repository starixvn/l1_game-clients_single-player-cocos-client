import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterGapAmount extends cc.Component {
    @property(cc.Label)
    gapAmount: cc.Label = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteFrame)
    upImage: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    downImage: cc.SpriteFrame = null;

    isUpResult = false;

    public setData(data: any) {
        const gapValue = BitcoinMasterUtils.getUpDownResult(data);
        const color = cc.Color.WHITE;
        this.gapAmount.node.active = true;

        if (gapValue === 0) {
            this.gapAmount.string = "00.00";
            this.gapAmount.node.color = color.fromHEX("#BAC5CA");
            this.icon.node.active = false;
        } else {
            this.gapAmount.string = BitcoinMasterUtils.absResult(gapValue);
            this.isUpResult = gapValue > 0;
            this.gapAmount.node.color = this.isUpResult ? color.fromHEX("#c4f738") : color.fromHEX("#F3485F");
            this.icon.node.active = true;
            this.icon.spriteFrame = this.isUpResult ? this.upImage : this.downImage;
        }
    }
}
