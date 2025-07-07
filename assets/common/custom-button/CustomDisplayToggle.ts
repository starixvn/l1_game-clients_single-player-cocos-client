const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomDisplayToggle extends cc.Toggle {
    @property(cc.Node)
    disabledDisplayNode: cc.Node = null;

    @property(cc.Node)
    unCheckImage: cc.Node = null;

    @property(cc.Node)
    checkMarkNode: cc.Node = null;

    _updateCheckMark() {
        super._updateCheckMark();

        this.unCheckImage && (this.unCheckImage.active = !this.isChecked);
        this.checkMarkNode && (this.checkMarkNode.active = this.isChecked);
    }

    _updateState() {
        super._updateState();
        if (this.disabledDisplayNode) {
            this.disabledDisplayNode.active = !this.interactable;
        }
    }
}
