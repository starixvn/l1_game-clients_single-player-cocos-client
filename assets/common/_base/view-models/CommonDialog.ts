import BounceInEffect from "../../animations/BounceInEffect";
import AudioManager from "../../audio/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonDialog extends BounceInEffect {
    @property({ override: true })
    time = 0.4;

    private readonly onDidHideActions = [];
    private readonly onWillShowActions = [];
    private readonly onWillHideActions = [];

    closeDialog(enableSound = true) {
        this.onWillHide();
        cc.tween(this.node)
            .to(this.time, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.active = false;
                this.onDidHide();
            })
            .start();

        enableSound && AudioManager.getInstance().playClick();
    }

    showDialog() {
        this.onWillShow();
        this.node.active = true;
    }

    closeDialogWithoutAnim() {
        this.node.active = false;
    }

    addOnDidHide(action: () => void) {
        this.onDidHideActions.push(action);
    }

    addOnWillHide(action: () => void) {
        this.onWillHideActions.push(action);
    }

    addOnWillShow(action: () => void) {
        this.onWillShowActions.push(action);
    }

    private onDidHide() {
        this.onDidHideActions.forEach((action) => action());
    }

    private onWillShow() {
        this.onWillShowActions.forEach((action) => action());
    }

    private onWillHide() {
        this.onWillHideActions.forEach((action) => action());
    }
}
