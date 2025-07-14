const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class SpinButton extends cc.Component {
    @property(cc.Button)
    spinButton: cc.Button = null;

    @property(cc.Label)
    autoSpinCountLabel: cc.Label = null;

    needShowAutoSpin = true;

    hideAutoSpin() {
        this.needShowAutoSpin = false;
    }

    setAutoSpinCount(count: number) {
        this.needShowAutoSpin && (this.autoSpinCountLabel.string = count.toString());
    }

    active() {
        this.spinButton.interactable = true;
    }

    deactive() {
        this.spinButton.interactable = false;
    }

    abstract playAnimationSpin();

    abstract playAnimationSpinTurbo();

    abstract playAnimationIdle();

    abstract showAutoSpinMode();

    abstract showNormalMode();
}
