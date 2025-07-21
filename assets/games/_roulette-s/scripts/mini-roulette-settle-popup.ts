import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Label)
    totalBetAmount: cc.Label = null;

    @property(cc.Label)
    totalWinAmount: cc.Label = null;

    @property(sp.Skeleton)
    trophyEffectSpine: sp.Skeleton = null;

    @property(sp.Skeleton)
    lightEffectSpine: sp.Skeleton = null;

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

        cc.tween(this.node)
            .to(0.6, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    private initAnimationSpines() {
        this.animationSpines.push(this.trophyEffectSpine, this.lightEffectSpine);
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
            this.scheduleOnce(() => {
                this.onConfettiTrigger?.();
            }, 0.03);
            this.playAnimation();
        } else {
            this.resetAnimation();
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
