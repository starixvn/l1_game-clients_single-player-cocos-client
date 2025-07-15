const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieWallet extends cc.Component {
    @property(cc.Node)
    overlay: cc.Node = null;

    @property(cc.Label)
    balance: cc.Label = null;

    focus(status: boolean) {
        if (this.overlay) {
            this.overlay.active = !status;
        }
        this.showActiveBackground(true);
    }

    showActiveBackground(status: boolean) {
        const sprite = this.getComponent(cc.Sprite);
        if (sprite) {
            sprite.enabled = status;
        }
    }
}
