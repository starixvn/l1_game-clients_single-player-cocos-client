const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoHideItemContainer extends cc.Component {
    @property(cc.Node)
    container: cc.Node = null;

    @property(cc.Node)
    mask: cc.Node = null;

    onLoad() {
        this.schedule(this.checkBorder, 0.1, cc.macro.REPEAT_FOREVER);
    }

    checkBorder() {
        const items = this.container.children;
        const box = this.mask.getBoundingBox();
        const pos = this.mask.convertToWorldSpaceAR(cc.v2(0, 0));
        const container = cc.rect(pos.x - box.width / 2, pos.y - box.height / 2, box.width, box.height);
        items.forEach((item) => {
            const itemBox = item.getBoundingBoxToWorld();
            const show = container.intersects(itemBox);
            item.children.forEach((child) => (child.active = show));
        });
    }
}
