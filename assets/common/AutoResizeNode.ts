const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoResizeNode extends cc.Component {
    @property(cc.Node)
    target: cc.Node = null;

    @property
    syncWidth = true;

    @property
    syncHeight = true;

    @property
    syncPosition = false;

    @property({
        visible: function () {
            return this.syncWidth;
        }
    })
    ratioWidth = 1;

    @property({
        visible: function () {
            return this.syncHeight;
        }
    })
    ratioHeight = 1;

    @property({
        visible: function () {
            return this.syncWidth;
        }
    })
    widthPadding = 0;

    @property({
        visible: function () {
            return this.syncHeight;
        }
    })
    heightPadding = 0;

    onLoad() {
        this.target.on(cc.Node.EventType.SIZE_CHANGED, this.resizeNode, this);
        this.resizeNode();
        if(this.syncPosition){
            this.target.on(cc.Node.EventType.POSITION_CHANGED, this.doSyncPosition, this);
            this.doSyncPosition()
        }
    }

    doSyncPosition(){
        this.node.position = this.node.parent.convertToNodeSpaceAR (this.target.convertToWorldSpaceAR(cc.v3(0)))
    }

    update(dt) {
        this.resizeNode();
    }

    onDestroy() {
        this.target.off(cc.Node.EventType.SIZE_CHANGED, this.resizeNode, this);
    }

    resizeNode() {
        this.setWidth();
        this.setHeight();

        const richText = this.getComponent(cc.RichText);
        if (richText) {
            richText.maxWidth = this.node.width;
        }

        this.node.children.forEach((child) => {
            const widget = child.getComponent(cc.Widget);
            if (widget) {
                widget.updateAlignment();
            }
        });
    }

    setWidth() {
        if (this.syncWidth) {
            this.node.width = this.target.width * this.ratioWidth + 2 * this.widthPadding;
        }
    }

    setHeight() {
        if (this.syncHeight) {
            this.node.height = this.target.height * this.ratioHeight;
        }
    }
}
