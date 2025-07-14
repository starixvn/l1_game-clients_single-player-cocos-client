import CascadingSlotTumbleItem from "./CascadingSlotTumbleItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingSlotTumbleList extends cc.Component {
    @property(cc.Prefab)
    tumbleItem: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    trialModeNode: cc.Node = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    private readonly HEIGHT_PER_ROW = 35;
    protected NUMBER_MAX_ITEM = 7;
    protected HEIGHT_CONTENT_REAL_MODE = 250;
    protected HEIGHT_CONTENT_TRIAL_MODE = 180;

    onLoad() {
        this.scrollView = this.scrollView.getComponent(cc.ScrollView);
    }

    get itemHeight() {
        return this.content.children.length > 0 ? this.content.children[0].height : this.HEIGHT_PER_ROW;
    }

    addIcons(icons: any) {
        this.content.active = true;
        Object.entries(icons).forEach(([key, value]) => {
            const tumbleNode = cc.instantiate(this.tumbleItem);
            const control = this.getTumbleItemComp(tumbleNode);
            const { count, win } = value as any;
            control.setData(+key, count, win);
            this.setAnimation(tumbleNode, this.content.childrenCount);
            this.content.addChild(tumbleNode);
        });
        this.updateContentHeight();
    }

    getTumbleItemComp(tumbleNode: cc.Node) {
        return tumbleNode.getComponent(CascadingSlotTumbleItem);
    }

    updateContentHeight() {
        const contentHeight = this.content.childrenCount * this.itemHeight;
        this.content.height = contentHeight;
        const enabledScrollView = contentHeight > this.scrollView.node.height;
        this.scrollView.enabled = enabledScrollView;
        if (enabledScrollView) {
            this.scrollView.scrollToTop(0);
        } else {
            this.content.position = cc.v3(0, 0);
        }
    }

    fall(node: cc.Node) {
        return new Promise<void>((resolve) => {
            cc.tween(node)
                .to(0.4, { position: cc.v3(0, this.itemHeight / 2, 0), opacity: 0 }, { easing: "sineOut" })
                .call(() => resolve())
                .start();
        });
    }

    async clear() {
        await Promise.all(this.content.children.map((child) => this.fall(child)));
        this.content.destroyAllChildren();
        this.updateContentHeight();
    }

    setAnimation(node: cc.Node, index: number) {
        const startY = (index + this.NUMBER_MAX_ITEM + 0.5) * this.itemHeight;
        const minY = this.scrollView.node.height - 0.5 * this.itemHeight;
        node.position = cc.v3(0, Math.max(startY, minY), 0);

        const destY = (index + 0.5) * this.itemHeight;
        cc.tween(node)
            .to(0.2, { position: cc.v3(0, destY, 0) }, { easing: "sineOut" })
            .to(0.1, { position: cc.v3(0, destY + 2, 0) }, { easing: "sineOut" })
            .to(0.1, { position: cc.v3(0, destY, 0) }, { easing: "sineOut" })
            .start();
    }

    offerTrialMode(isTrialMode: boolean) {
        this.trialModeNode.active = isTrialMode;
        this.setHeightContent(isTrialMode);
        this.updateContentHeight();
    }

    setHeightContent(isTrialMode: boolean) {
        const scrollViewNode = this.scrollView.node;
        if (isTrialMode) {
            scrollViewNode.height = this.HEIGHT_CONTENT_TRIAL_MODE;
        } else {
            scrollViewNode.height = this.HEIGHT_CONTENT_REAL_MODE;
        }
    }
}
