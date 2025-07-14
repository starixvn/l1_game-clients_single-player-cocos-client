import LineSelectionDialog from "./LineSelectionDialog";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardLineSelectionDialog extends LineSelectionDialog {
    @property({ type: cc.Node, override: true, visible: false })
    bgActive: cc.Node[] = [];

    @property({ type: cc.Button, override: true, visible: false })
    confirmButton: cc.Button = null;

    loadPaylineSprite(num): cc.SpriteFrame {
        return this.atlas.getSpriteFrame(`line-selection-${num}`);
    }
}
