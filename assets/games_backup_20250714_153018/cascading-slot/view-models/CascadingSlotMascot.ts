const { ccclass, property } = cc._decorator;

enum MascotAnimation {
    Idle = "Idle",
    Gunshot = "gunshot2"
}

@ccclass
export default class CascadingSlotMascot extends cc.Component {
    @property(sp.Skeleton)
    animation: sp.Skeleton = null;

    onLoad() {
        this.animation.setEndListener(() => {
            if (this.animation.animation === MascotAnimation.Gunshot) {
                this.playAnimationIdle();
            }
        });
    }

    playAnimationForTumble() {
        this.animation.setAnimation(0, MascotAnimation.Gunshot, false);
    }

    playAnimationIdle() {
        this.animation.setAnimation(0, MascotAnimation.Idle, true);
    }
}
