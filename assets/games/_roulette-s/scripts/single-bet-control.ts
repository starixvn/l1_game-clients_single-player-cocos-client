const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleBetControl extends cc.Component {
    @property(cc.Node)
    nonZeroNode: cc.Node = null;

    onLoad() {
        this.nonZeroNode.children.forEach((child, index) => {
            child.name = `${index + 1}`;
        });
        this.hideControl();
    }

    showControl() {
        this.node.active = true;
    }

    hideControl() {
        this.node.active = false;
    }
}
