const { ccclass, property } = cc._decorator;
@ccclass
export default abstract class GameGuideBase extends cc.Component {
    @property({ type: cc.Label })
    replaceNodes: cc.Label[] = [];

    @property(cc.Node)
    mainFrame: cc.Node = null;

    onLoad() {
        const commonDialog = this.mainFrame.getComponent("CommonDialog");
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }

    init(configs) {
        const replaceData = this.createReplaceData(configs);

        this.replaceNodes.forEach((label) => {
            Object.keys(replaceData).forEach((key) => {
                const reg = new RegExp(key, "g");
                label.string = label.string.replace(reg, replaceData[key]);
            });
        });
    }

    abstract createReplaceData(configs): {};
}
