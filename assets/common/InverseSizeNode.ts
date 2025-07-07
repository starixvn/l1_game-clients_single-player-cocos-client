const { ccclass, property } = cc._decorator;

@ccclass
export default class InverseSizeNode extends cc.Component {
    onLoad() {
        const parent = this.node.parent;
        if (!parent) {
            return;
        }
        this.updateSizeNode();
        parent.on(cc.Node.EventType.SIZE_CHANGED, this.updateSizeNode, this);
    }

    updateSizeNode() {
        const parent = this.node.parent;
        if (!parent) {
            return;
        }

        this.node.width = parent.height;
        this.node.height = parent.width;
    }
}
