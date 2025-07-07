import CallbackAnimation from "./CallbackAnimation";
import GameUtils from "./GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CallbackSkeleton extends CallbackAnimation {
    @property({ visible: false, override: true })
    animation: cc.Animation = null;

    @property(sp.Skeleton)
    effect: sp.Skeleton = null;

    protected duration: number;

    onLoad() {
        this.effect.setCompleteListener(() => this.finish());
    }

    setDuration(duration: number) {
        this.duration = duration;
    }

    updateDuration(duration: number) {
        GameUtils.updateSpineDuration(this.effect, this.effect.defaultAnimation, duration);
    }

    play() {
        this.duration && this.updateDuration(this.duration);
        this.effect.setAnimation(0, this.effect.animation, false);
    }
}
