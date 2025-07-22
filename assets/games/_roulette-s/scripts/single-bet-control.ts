const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleBetControl extends cc.Component {
    @property(cc.Node)
    nonZeroNode: cc.Node = null;

    @property(cc.Node)
    backgroundNode: cc.Node = null;

    onLoad() {
        this.nonZeroNode.children.forEach((child, index) => {
            child.name = `${index + 1}`;
        });
        this.hideControl();
        
        if (this.backgroundNode) {
            this.backgroundNode.on('click', this.onBackgroundClick, this);
        }
    }

    onDestroy() {
        if (this.backgroundNode) {
            this.backgroundNode.off('click', this.onBackgroundClick, this);
        }
    }

    private onBackgroundClick() {
        this.hideControl();
    }

    get isActive() {
        return this.node.active;
    }

    showControl() {
        this.node.active = true;
    }

    hideControl() {
        this.node.active = false;
    }
}
