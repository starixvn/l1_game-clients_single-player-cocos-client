import CascadingSlotTumbleList from "./CascadingSlotTumbleList";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingSlotTumbleList extends CascadingSlotTumbleList {
    @property({ type: cc.Prefab, override: true, visible: false })
    tumbleItem: cc.Prefab = null;

    @property(cc.Node)
    maskNode: cc.Node = null;

    mainAtlas: cc.SpriteAtlas = null;

    NUMBER_MAX_ITEM = 6;
    HEIGHT_CONTENT_REAL_MODE = 220;
    HEIGHT_CONTENT_TRIAL_MODE = 180;
    gameId: number;

    setHeightContent(isTrialMode: boolean) {
        this.updateScrollViewHeight(isTrialMode);
        this.updateMaskSprite(isTrialMode);
    }

    private updateScrollViewHeight(isTrialMode: boolean) {
        const height = isTrialMode ? this.HEIGHT_CONTENT_TRIAL_MODE : this.HEIGHT_CONTENT_REAL_MODE;
        this.scrollView.node.height = height;
    }

    private updateMaskSprite(isTrialMode: boolean) {
        const mask = this.maskNode.getComponent(cc.Mask);
        if (!mask.spriteFrame) {
            return;
        }

        const spriteFrameName = isTrialMode ? "tumble-win-mask-trial" : "tumble-win-mask-real";
        mask.spriteFrame = this.mainAtlas.getSpriteFrame(spriteFrameName);
    }

    getTumbleItemComp(tumbleNode: cc.Node) {
        const control = super.getTumbleItemComp(tumbleNode);
        control.mainAtlas = this.mainAtlas;
        return control;
    }
}
