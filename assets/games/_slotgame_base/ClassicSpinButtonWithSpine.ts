import ClassicSpinButton from "./ClassicSpinButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClassicSpinButtonWithSpine extends ClassicSpinButton {
    @property({ visible: false, override: true })
    autoSpinCountLabel: cc.Label = null;

    @property({ visible: false, override: true })
    spinAnimation: cc.Animation = null;

    @property({ visible: false, override: true })
    spinParticle: cc.ParticleSystem = null;

    @property(sp.Skeleton)
    iconSpinSkeleton: sp.Skeleton = null;

    onLoad() {
        this.hideAutoSpin();
    }

    override playAnimationSpin() {
        this.iconSpinSkeleton && this.iconSpinSkeleton.setAnimation(0, "active", true);
    }

    override playAnimationIdle() {
        this.iconSpinSkeleton && this.iconSpinSkeleton.setAnimation(0, "idle", true);
    }
}
