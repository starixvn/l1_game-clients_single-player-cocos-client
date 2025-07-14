import BalancedBettingPoolBetItem from "../../_base/view-models/BalancedBettingPoolBetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterBalancedBettingPoolBetItem extends BalancedBettingPoolBetItem {
    @property(cc.Animation)
    choice: cc.Animation = null;

    public setHighlight(highlight: boolean, isAnimated = true) {
        highlight && this.choice.play();
    }

    public resetHighlight() {
        this.choice.stop();
    }
}
