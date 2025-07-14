const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieWallet extends cc.Component {
    @property(cc.Node)
    overlay: cc.Node = null;

    @property(cc.Label)
    balance: cc.Label = null;

    focus(status: boolean) {
        this.overlay.active = !status;
        this.showActiveBackground(true);
    }

    showActiveBackground(status: boolean) {
        this.getComponent(cc.Sprite).enabled = status;
    }
}
