import AutoResizeNode from "../../../common/AutoResizeNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CalculateMainGameWidth extends AutoResizeNode {
    @property(cc.Node)
    subGameArea: cc.Node = null;

    @property(cc.Node)
    subGameScaleWidth: cc.Node = null;

    setWidth() {
        if (this.syncWidth) {
            let mainGameWidth = this.target.width * this.ratioWidth + 2 * this.widthPadding;
            const subGameWidth = this.subGameScaleWidth.width * this.subGameScaleWidth.scale;
            if (this.subGameArea.width > subGameWidth) {
                mainGameWidth += this.subGameArea.width - subGameWidth;
            }
            this.node.width = mainGameWidth;
        }
    }
}
