const { ccclass, property } = cc._decorator;

@ccclass
export default class HandleSwapAction extends cc.Component {
    @property(cc.Sprite)
    swapSprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    swapOnFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    swapOffFrame: cc.SpriteFrame = null;

    onLoad() {
        this.setIonSwapOn();
    }

    setSwapStatus(status: boolean) {
        status ? this.setIonSwapOff() : this.setIonSwapOn();
    }

    setIonSwapOn() {
        this.swapSprite.spriteFrame = this.swapOnFrame;
    }

    setIonSwapOff() {
        this.swapSprite.spriteFrame = this.swapOffFrame;
    }

    setDisable() {
        this.changeOpacity(100);
        this.node.getComponent(cc.Button).interactable = false;
    }

    setEnable() {
        this.changeOpacity(255);
        this.node.getComponent(cc.Button).interactable = true;
    }

    changeOpacity(value: number) {
        this.swapSprite.node.opacity = value;
    }
}
