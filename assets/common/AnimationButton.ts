const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimationButton extends cc.Button {
    @property(cc.Animation)
    animation: cc.Animation = null;

    _updateState() {
        super._updateState();

        if (this.interactable) {
            this.animation.play("active");
        } else {
            this.animation.play("inactive");
        }
    }
}
