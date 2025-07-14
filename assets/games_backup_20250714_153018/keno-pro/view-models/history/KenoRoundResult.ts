import GameUtils from "../../../../common/GameUtils";
import GameTicketDetailBase from "../../../_base/view-models/GameTicketDetailBase";
import KenoUtils from "../../../mini-keno/view-models/KenoUtils";
import BetChoice from "../BetChoice";
import KenoNumber from "../KenoNumber";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KenoRoundResult extends GameTicketDetailBase {
    @property(cc.Label)
    round: cc.Label = null;

    @property(cc.Label)
    total: cc.Label = null;

    @property(cc.Node)
    settleResult: cc.Node = null;

    @property(cc.Node)
    resultNumbers: cc.Node = null;

    protected result: number[] = [];
    protected betChoices: BetChoice[] = [];
    protected kenoNumbers: KenoNumber[] = [];
    isShowTitleBetDetail = false;

    onLoad() {
        this.kenoNumbers = this.resultNumbers.children.map((child) => child.getComponent(KenoNumber));
        this.kenoNumbers.forEach((keno) => keno.hide());
        this.betChoices = this.settleResult.children.map((child) => child.getComponent(BetChoice));
    }

    public setData(result: number[], settlementResult: any) {
        this.result = result;
        this.settlementResult = settlementResult;
    }

    public showResult(animated = false, duration = 0, onComplete: () => void = () => {}) {
        this.node.active = true;

        if (animated) {
            this.total.string = "0";
            this.kenoNumbers.forEach((keno) => keno.hide());

            const i = 0;
            const miniType = this.result.length < 20;
            let index = this.result.length - 1;
            let total = 0;
            const sequence = cc.sequence(
                cc.callFunc(() => {
                    const number = this.result[index];
                    this.kenoNumbers[index].setNumber(number, true);
                    total += number;
                    this.showSettleResult(KenoUtils.getSettleResult(total, miniType));
                    this.total.string = total.toString();
                    --index;
                }),
                cc.delayTime(duration / this.result.length)
            );

            this.node.runAction(
                cc.sequence(
                    cc.repeat(sequence, this.result.length),
                    cc.callFunc(() => {
                        this.total.node.runAction(cc.sequence(cc.scaleTo(0.1, 1.2), cc.scaleTo(0.1, 1)));
                        this.betChoices.forEach((label) => {
                            label.node.runAction(cc.sequence(cc.scaleTo(0.1, 1.2), cc.scaleTo(0.1, 1)));
                        });
                        this.showSettleResult(this.settlementResult);
                        onComplete();
                    })
                )
            );
        } else {
            let total = 0;
            for (let i = 0; i < this.result.length; i++) {
                total += this.result[i];
                this.kenoNumbers[i].setNumber(this.result[i], false);
            }
            this.total.string = total.toString();
            this.showSettleResult(this.settlementResult);
        }
    }

    protected showSettleResult(settlementResult: any) {
        let index = 0;

        if (!settlementResult) {
            return;
        }

        Object.keys(settlementResult).forEach((key) => {
            if (settlementResult[key]) {
                const betChoice = this.betChoices[index];
                const choice = GameUtils.getBetChoiceString(key);
                betChoice.setValue(choice.toUpperCase());
                index++;
            }
        });
    }
}
