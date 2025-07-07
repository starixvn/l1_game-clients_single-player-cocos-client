const { ccclass, property } = cc._decorator;

@ccclass
export default class SkeletonMiniIcon extends cc.Component {
    @property(cc.Node)
    skeletonLoading: cc.Node = null;

    @property(cc.Label)
    gameName: cc.Label = null;

    @property(cc.Sprite)
    iconSprite: cc.Sprite = null;

    @property(cc.Node)
    containerCounter: cc.Node = null;

    hideSkeleton() {
        this.skeletonLoading.active = false;
    }
}
