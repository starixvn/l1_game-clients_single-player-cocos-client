const { ccclass, property } = cc._decorator;

@ccclass
export default class SyncParentColor extends cc.Component {
    onLoad() {
        this.node.on(cc.Node.EventType.COLOR_CHANGED, this.onColorChanged, this);
    }

    start() {
        this.onColorChanged();
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.COLOR_CHANGED, this.onColorChanged, this);
    }

    onColorChanged() {
        this.node.children.forEach((child) => (child.color = this.node.color));
    }
}
