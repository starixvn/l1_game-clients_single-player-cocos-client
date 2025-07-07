import GameUtils from "../../../common/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KenoSettlementWinChoices extends cc.Component {
    @property(cc.Node)
    container: cc.Node = null;

    choices: cc.Label[] = [];

    onLoad() {
        this.choices = this.container.getComponentsInChildren(cc.Label);
    }

    setSettlement(settlementResult: any) {
        let index = 0;

        if (!settlementResult) {
            return;
        }

        Object.keys(settlementResult).forEach((key) => {
            if (settlementResult[key]) {
                const betChoice = this.choices[index];
                const choice = GameUtils.getBetChoiceString(key);
                betChoice.string = choice.toUpperCase();
                index++;
            }
        });
    }
}
