import AnimationUtils from "../../../common/utils/AnimationUtils";


const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    totalBetAmount: cc.Label = null;

    @property(cc.Label)
    totalWinAmount: cc.Label = null;

    showSettlementResult(betWinAmount: number, betAmount: number) {
        this.totalBetAmount.string = betAmount.toString();
        this.totalWinAmount.string = betWinAmount.toString();

        this.node.active = true;
    }

    hideSettlementResult() {
        this.node.active = false;
    }
}
