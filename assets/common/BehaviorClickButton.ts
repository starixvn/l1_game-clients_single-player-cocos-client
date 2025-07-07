const { ccclass, property } = cc._decorator;

@ccclass
export default class BehaviorClickButton extends cc.Component {
    @property(cc.Button)
    button: cc.Button = null;

    @property(cc.Node)
    disableNode: cc.Node = null;

    onLoad(): void {
        this.updateState(false);
    }

    updateState(state: boolean) {
        this.button.interactable = !state;
        this.disableNode.active = state;
    }
}
