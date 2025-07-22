import BetChips from "../../../../common/bet-chips/view-models/BetChips";
import TutorialMain from "../../../../common/tutorial/TutorialMain";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniRouletteTutorialMain extends TutorialMain {
    @property(cc.Node)
    betChipNode: cc.Node = null;

    betChip: BetChips = null;

    loadBetChips(gameConfigs: any) {
        if (!gameConfigs || !this.betChip) {
            return;
        }

        this.betChip.setChipValues(gameConfigs);
        this.betChip.init((bet) => {
            this.onChangedBetChip(bet);
        });
    }

    protected onChangedBetChip(bet) {}

    protected initBetChipByLoader(node: cc.Node) {
        const betChips = node.getComponent(BetChips);
        this.betChip = betChips;
    }
}
