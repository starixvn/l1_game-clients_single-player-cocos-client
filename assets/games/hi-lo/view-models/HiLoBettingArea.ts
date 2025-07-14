import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

export const BettingAreaEvents = {
    PLACING_BET: "PLACING BET"
};

@ccclass
export default class HiLoBettingArea extends cc.Component {
    @property(cc.String)
    betChoice = "";

    @property(cc.Node)
    disableLayer: cc.Node = null;

    @property(cc.Animation)
    animation: cc.Animation = null;

    @property(cc.Label)
    stakeAmount: cc.Label = null;

    placingBet() {
        this.animation.play("pressed");
        this.node.emit(BettingAreaEvents.PLACING_BET, this.betChoice);
    }

    enableBetChoice(status: boolean) {
        this.disableLayer.active = !status;
    }

    updateStakeAmount(value: number, animated = true) {
        this.stakeAmount.string = numberWithCommas(value, 2);
        animated &&
            cc
                .tween(this.stakeAmount.node)
                .to(0.2, { scale: 1.05 }, { easing: "easeIn" })
                .delay(0.1)
                .to(0.2, { scale: 1 }, { easing: "easeOut" })
                .start();
    }

    resetStakeAmount() {
        this.stakeAmount.string = "";
    }
}
