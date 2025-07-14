import ClassicSpinButton from "./ClassicSpinButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardSlotSpinButton extends ClassicSpinButton {
    @property({ visible: false, override: true })
    autoSpinCountLabel: cc.Label = null;

    @property({ visible: false, override: true })
    spinAnimation: cc.Animation = null;

    @property({ visible: false, override: true })
    spinParticle: cc.ParticleSystem = null;

    @property({ visible: false, override: true })
    freeSpinLabel: cc.Label = null;

    @property({ visible: false, override: true })
    textSpinInFreeSpin: cc.Node = null;

    @property({ visible: false, override: true })
    normalSpinNode: cc.Node = null;

    @property(sp.Skeleton)
    iconSpinSkeleton: sp.Skeleton = null;

    onLoad() {
        this.hideAutoSpin();
    }

    override playAnimationSpin() {
        if (!this.iconSpinSkeleton) {
            return;
        }
        this.iconSpinSkeleton.setAnimation(0, "spin", true);
        this.iconSpinSkeleton.setAnimation(3, "spin-extra", false);
        this.iconSpinSkeleton.timeScale = 1;
    }

    override playAnimationIdle() {
        this.iconSpinSkeleton && this.iconSpinSkeleton.setAnimation(0, "idle", true);
        this.iconSpinSkeleton.timeScale = 1;
    }

    override showAutoSpinMode() {}
    override hideAll() {}
    override showNormalMode() {}
    override playAnimationSpinTurbo() {
        this.playAnimationSpin();

        if (!this.iconSpinSkeleton) {
            return;
        }
        this.iconSpinSkeleton.timeScale = 2;
    }
}
