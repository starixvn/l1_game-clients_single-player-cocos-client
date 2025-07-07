import GameBase from "../../games/_base/GameBase";
import GameUtils from "../GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExtraFeature extends cc.Component {
    protected main: GameBase;

    get noticeNode() {
        return this.main.noticeNode;
    }

    onLoad() {
        this.main = this.node.getComponent(GameBase);
    }

    showAcceptedBet(bet: number) {
        GameUtils.addFlyingText(this.noticeNode, false, bet, 1);
    }

    showWinningBet(bet: number) {
        const winningBet = GameUtils.addFlyingText(this.noticeNode, true, bet, 4);
        winningBet.name = "winningBet";
    }

    clearWinningBet() {
        const winningBet = this.noticeNode.getChildByName("winningBet");
        if (winningBet) {
            winningBet.destroy();
        }
    }
}
