import GameUtils from "../GameUtils";
import ExtraFeature from "./ExtraFeature";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TableGameExtraFeature extends ExtraFeature {
    protected winningEffectDuration = 3;
    get userProfile() {
        return this.main.userProfile;
    }

    showAcceptedBet(bet: number) {
        GameUtils.addFlyingText(this.userProfile.node, false, bet, 1, 80);
    }

    showWinningBet(bet: number) {
        const winningBet = GameUtils.addFlyingText(this.userProfile.node, true, bet, this.winningEffectDuration, 80, 10);
        winningBet.name = "winningBet";
    }

    clearWinningBet() {
        const winningBet = this.userProfile.node.getChildByName("winningBet");
        if (winningBet) {
            winningBet.destroy();
        }
    }
}
