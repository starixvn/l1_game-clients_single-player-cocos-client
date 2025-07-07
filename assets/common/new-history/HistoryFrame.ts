import PaginationCommon from "../helpers/Pagination/PaginationCommon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HistoryFrame extends cc.Component {
    @property(cc.Node)
    tableBg: cc.Node = null;

    @property(PaginationCommon)
    pagination: PaginationCommon = null;

    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Node)
    backWrapper: cc.Node = null;

    @property(cc.Node)
    mainFrame: cc.Node = null;

    @property(cc.Label)
    gameName: cc.Label = null;

    @property(cc.Node)
    titleBgNode: cc.Node = null;

    @property(cc.Layout)
    title: cc.Layout = null;

    protected readonly PADDING = 12;
    protected readonly PADDING_TOP_HEIGHT = 60;
    protected PADDING_AROUND_POPUP = 80;

    protected needUpdateAutoScaleWidth = true;
    public clickCloseButton = () => {};

    onLoad() {
        this.gameName.node.active = false;
    }

    updateSizeFrame(widthContent: number, heightContent: number, autoScaleNodeWidth: number) {
        const mainFrameWidth = widthContent + this.PADDING * 2;
        const mainFrameHeight = heightContent + this.PADDING + this.PADDING_TOP_HEIGHT;
        if (this.mainFrame.children.length > 0) {
            this.mainFrame.children.forEach((child) => {
                child.width = mainFrameWidth / 2;
                child.height = mainFrameHeight;
            });
        } else {
            this.mainFrame.height = mainFrameHeight;
        }

        this.tableBg.width = widthContent;
        this.tableBg.height = heightContent;
        this.backWrapper.width = mainFrameWidth;

        this.updateAutoScaleByWidth();
    }

    updateAutoScaleByWidth() {
        if (!this.needUpdateAutoScaleWidth) {
            return;
        }
        const padding = this.PADDING_AROUND_POPUP;
        const autoScaleNode = this.backWrapper.parent;
        if (this.backWrapper.width + padding > autoScaleNode.width) {
            autoScaleNode.width = this.backWrapper.width + padding;
        }
    }

    updateTitleSize(width: number) {
        if (this.titleBgNode) {
            this.titleBgNode.children.forEach((child) => {
                child.width = width / 2;
            });
            this.titleBgNode.getComponent(cc.Layout).updateLayout();
        }
    }

    closePopup() {
        this.clickCloseButton();
    }
}
