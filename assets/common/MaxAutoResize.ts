const { ccclass, property } = cc._decorator;

@ccclass
export default class MaxAutoResize extends cc.Component {
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

    update() {
        this.doSyncWidth();
        this.doSyncHeight();
    }

    private doSyncWidth() {
        if (this.syncWidth) {
            let maxW = 0;
            this.node.children.forEach((child) => {
                child.active && (maxW = Math.max(maxW, child.width));
            });

            this.node.width = maxW * this.ratioWidth + 2 * this.widthPadding;
        }
    }

    private doSyncHeight() {
        if (this.syncHeight) {
            let maxH = 0;
            this.node.children.forEach((child) => {
                child.active && (maxH = Math.max(maxH, child.height));
            });

            this.node.height = maxH * this.ratioHeight + 2 * this.heightPadding;
        }
    }
}
