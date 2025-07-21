import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import AudioManager from "../../../common/audio/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Label)
    totalBetAmount: cc.Label = null;

    @property(cc.Label)
    totalWinAmount: cc.Label = null;

    @property(sp.Skeleton)
    lightEffectSpine: sp.Skeleton = null;

    @property(cc.AudioClip)
    confettiSound1: cc.AudioClip = null;

    @property(cc.AudioClip)
    confettiSound2: cc.AudioClip = null;

    public onConfettiTrigger: () => void = null;

    private readonly animationSpines: sp.Skeleton[] = [];

    onLoad() {
        this.initAnimationSpines();
        this.resetAnimation();
    }

    showSettlementResult(betWinAmount: number, betAmount: number) {
        this.updateLabels(betWinAmount, betAmount);
        this.showPopup();
        this.handleWinCondition(betWinAmount, betAmount);

        cc.tween(this.node).to(0.6, { scale: 1, opacity: 255 }, { easing: "backOut" }).start();
    }

    hideSettlementResult() {
        this.resetAnimation();
        AudioManager.getInstance().playClick();

        cc.tween(this.node)
            .to(0.6, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    private initAnimationSpines() {
        this.animationSpines.push(this.lightEffectSpine);
    }

    private updateLabels(betWinAmount: number, betAmount: number) {
        this.totalBetAmount.string = numberWithCommas(betAmount);
        this.totalWinAmount.string = numberWithCommas(betWinAmount);
    }

    private showPopup() {
        this.node.active = true;
        this.node.scale = 0;
        this.node.opacity = 0;
    }

    private handleWinCondition(betWinAmount: number, betAmount: number) {
        if (betWinAmount >= betAmount) {
            this.playWinSound();
            this.scheduleOnce(() => {
                this.onConfettiTrigger?.();
            }, 0.03);
            this.playAnimation();
        } else {
            this.resetAnimation();
        }
    }

    private playWinSound() {
        if (this.confettiSound1) {
            AudioManager.getInstance().playSFX(this.confettiSound1);
        }
        if (this.confettiSound2) {
            AudioManager.getInstance().playSFX(this.confettiSound2);
        }
    }

    private playAnimation() {
        this.animationSpines.forEach((spine) => {
            if (spine) {
                spine.node.active = true;
                spine.setAnimation(0, "show", false);
            }
        });
    }

    private resetAnimation() {
        this.animationSpines.forEach((spine) => {
            if (spine) {
                spine.node.active = false;
                spine.setAnimation(0, "", false);
            }
        });
    }
}
