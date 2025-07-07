import NewButton from "./NewButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FadeEffectButton extends cc.Component {
    @property(cc.Node)
    disabledLayer: cc.Node = null;

    setActive(status = true) {
        this.node.active = status;
        this.node.getComponent(NewButton).collider.getComponent(cc.PolygonCollider).enabled = status;
    }

    async setDisabled(status: boolean) {
        this.disabledLayer && (this.disabledLayer.active = status);
    }
}
