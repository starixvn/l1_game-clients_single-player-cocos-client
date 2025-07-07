import HistoryFrame from "./HistoryFrame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PortraitHistoryFrame extends HistoryFrame {
    protected override PADDING_AROUND_POPUP = 40;
    updateSizeFrame(widthContent: number, heightContent: number, autoScaleNodeWidth: number) {
        super.updateSizeFrame(widthContent, heightContent, autoScaleNodeWidth);

        this.backWrapper.height = this.mainFrame.children[0].height;

        const padding = this.PADDING_AROUND_POPUP;
        const autoScaleNode = this.backWrapper.parent;
        if (this.backWrapper.height + padding > autoScaleNode.height) {
            autoScaleNode.height = this.backWrapper.height + padding;
        }
    }
}
