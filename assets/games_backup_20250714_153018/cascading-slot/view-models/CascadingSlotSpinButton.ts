import SpinButton from "../../_slotgame_base/SpinButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingSlotSpinButton extends SpinButton {
    @property(cc.Animation)
    animation: cc.Animation = null;

    override playAnimationSpin() {
        this.animation.getAnimationState(this.animation.defaultClip.name).speed = 1.5;
        this.animation.play();
    }

    override playAnimationSpinTurbo() {
        this.animation.getAnimationState(this.animation.defaultClip.name).speed = 3;
        this.animation.play();
    }

    override playAnimationIdle() {
        this.animation.getAnimationState(this.animation.defaultClip.name).speed = 0.4;
        this.animation.play();
    }

    override showAutoSpinMode() {}

    override showNormalMode() {}
}
