const { ccclass, property } = cc._decorator;

@ccclass
export default class BetDetailFrame extends cc.Component {
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

    private backFrameLayout: cc.Layout;

    public clickCloseButton = () => {};
    isShowTitleBetDetail: boolean;

    protected PADDING_AROUND_POPUP = 80;

    onLoad() {
        this.gameName.node.active = false;
        this.backFrameLayout = this.mainFrame.getComponent(cc.Layout);
    }

    updateSizeFrame(widthContent: number, heightContent: number) {
        this.mainFrame.children.forEach((child) => {
            child.width = widthContent / 2;
            child.height = heightContent;
        });
        this.backFrameLayout?.updateLayout();
        this.backWrapper.width = this.mainFrame.width;

        if (this.titleBgNode && this.titleBgNode.parent) {
            this.titleBgNode.parent.active = this.isShowTitleBetDetail;
        }

        const padding = this.PADDING_AROUND_POPUP;
        const autoScaleNode = this.backWrapper.parent;
        if (this.backWrapper.width + padding > autoScaleNode.width) {
            autoScaleNode.width = this.backWrapper.width + padding;
        }

        if (this.backWrapper.height + padding > autoScaleNode.height) {
            autoScaleNode.height = this.backWrapper.height + padding;
        }
    }

    updateTitleSize(width: number) {
        this.titleBgNode.children.forEach((child) => {
            child.width = width / 2;
        });
        this.titleBgNode.getComponent(cc.Layout).updateLayout();
    }

    closePopup() {
        this.clickCloseButton();
    }
}
