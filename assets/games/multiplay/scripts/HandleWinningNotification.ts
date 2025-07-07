const { ccclass, property } = cc._decorator;

@ccclass
export default class HandleWinningNotification extends cc.Component {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteFrame)
    notificationOnFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    notificationOffFrame: cc.SpriteFrame = null;

    setSwapStatus(status: boolean) {
        status ? this.setIonSwapOn() : this.setIonSwapOff();
    }

    setIonSwapOn() {
        this.icon.spriteFrame = this.notificationOnFrame;
    }

    setIonSwapOff() {
        this.icon.spriteFrame = this.notificationOffFrame;
    }
}
