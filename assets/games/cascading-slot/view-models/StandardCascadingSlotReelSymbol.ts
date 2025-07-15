const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingSlotReelSymbol extends cc.Component {
    @property(sp.Skeleton)
    effectSpine: sp.Skeleton = null;

    @property
    premultipliedAlpha = false;

    setAminamtion(spine: any) {
        const anim = "idle";
        this.effectSpine.skeletonData = spine;
        this.effectSpine.premultipliedAlpha = this.premultipliedAlpha;
        this.effectSpine.setAnimation(0, anim, true);
    }
}
