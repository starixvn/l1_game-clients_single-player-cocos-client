import CommonDialog from "../_base/view-models/CommonDialog";
const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoRebetDialog extends cc.Component {
    @property(cc.Node)
    mainFrame: cc.Node = null;

    onLoad() {
        const commonDialog = this.mainFrame.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }
}
