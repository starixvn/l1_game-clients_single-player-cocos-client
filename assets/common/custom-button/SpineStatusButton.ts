import StatusButton, { ButtonState } from "../../common/custom-button/StatusButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpineStatusButton extends StatusButton {
    @property(sp.Skeleton)
    animation: sp.Skeleton = null;

    _applyTransition(state) {
        super._applyTransition(state);

        if (this.animation) {
            if (state === ButtonState.HOVER) {
                if (!this.animation.getCurrent(1)) {
                    this.animation.setAnimation(1, "hover", true);
                }
            } else {
                this.animation.setAnimation(1, "hover", true);
                this.animation.clearTrack(1);
            }

            if (state === ButtonState.NORMAL && !this.animation.getCurrent(0)) {
                this.animation.setAnimation(0, "idle", true);
            }

            state === ButtonState.DISABLED && this.animation.setAnimation(1, "disable", true);
        }
    }
}
