import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import AnimationUtils from "../../../common/utils/AnimationUtils";
import { easeIn } from "../../../../packages/i18n/runtime-scripts/creator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Label)
    totalBetAmount: cc.Label = null;

    @property(cc.Label)
    totalWinAmount: cc.Label = null;

    showSettlementResult(betWinAmount: number, betAmount: number) {
        this.totalBetAmount.string = numberWithCommas(betAmount);
        this.totalWinAmount.string = numberWithCommas(betWinAmount);

        this.node.active = true;
        this.node.scale = 0;
        this.node.opacity = 0;

        cc.tween(this.node)
            .to(0.4, { scale: 1.1, opacity: 100 })
            .to(0.1, { scale: 1, opacity: 255 }, { easing: cc.easing.sineOut })
            .start();
    }

    hideSettlementResult() {
        cc.tween(this.node)
            .to(0.3, { scale: 1.1, opacity: 100 })
            .to(0.3, { scale: 0, opacity: 0 }, { easing: cc.easing.sineIn })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }
}
