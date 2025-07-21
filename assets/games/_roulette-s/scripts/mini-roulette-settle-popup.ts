import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Label)
    totalBetAmount: cc.Label = null;

    @property(cc.Label)
    totalWinAmount: cc.Label = null;

    @property(sp.Skeleton)
    lightEffectSpine: sp.Skeleton = null;

    public onConfettiTrigger: () => void = null;

    onLoad() {
        this.resetLightEffect();
    }

    showSettlementResult(betWinAmount: number, betAmount: number) {
        this.totalBetAmount.string = numberWithCommas(betAmount);
        this.totalWinAmount.string = numberWithCommas(betWinAmount);

        this.node.active = true;
        this.node.scale = 0;
        this.node.opacity = 0;

        cc.tween(this.node)
            .to(0.6, { scale: 1, opacity: 255 }, { easing: "backOut" })
            .call(() => {
                if (betWinAmount >= betAmount) {
                    this.onConfettiTrigger?.();
                    this.playLightEffect();
                } else {
                    this.resetLightEffect();
                }
            })
            .start();
    }

    hideSettlementResult() {
        this.resetLightEffect();
        
        cc.tween(this.node)
            .to(0.6, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    private playLightEffect() {
        if (this.lightEffectSpine) {
            this.lightEffectSpine.node.active = true;
            this.lightEffectSpine.setAnimation(0, "show", false);
        }
    }

    private resetLightEffect() {
        if (this.lightEffectSpine) {
            this.lightEffectSpine.node.active = false;
            this.lightEffectSpine.setAnimation(0, "", false);
        }
    }
}
