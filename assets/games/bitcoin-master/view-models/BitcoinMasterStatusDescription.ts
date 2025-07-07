const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterStatusDescription extends cc.Component {
    @property(cc.Label)
    desc: cc.Label = null;

    @property(cc.Sprite)
    background: cc.Sprite = null;

    @property(cc.SpriteFrame)
    normalImage: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    warningImage: cc.SpriteFrame = null;

    onLoad() {
        this.background.node.active = false;
    }

    setNormalDescription(text: string, status = true) {
        this.background.node.active = true;
        this.desc.string = text;
        const color = cc.Color.WHITE;
        this.desc.node.color = status ? color.fromHEX("#f7e904") : color.fromHEX("#f9480a");
        this.background.spriteFrame = status ? this.normalImage : this.warningImage;
    }
}
