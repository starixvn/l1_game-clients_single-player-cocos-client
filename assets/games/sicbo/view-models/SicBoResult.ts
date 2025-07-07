import GameUtils from "../../../common/GameUtils";
import { SicBoBetType } from "./SicBoCommon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoResult extends cc.Component {
    @property(cc.Label)
    totalPoints: cc.Label = null;

    @property(cc.Label)
    result: cc.Label = null;

    setData(data: any) {
        const { result, settlementResult } = data[0];
        const color = cc.Color.WHITE;
        let choiceResult = "";
        if (settlementResult[SicBoBetType.anyTriple]) {
            choiceResult = GameUtils.getText("ui.any_triple");
            this.result.node.color = color.fromHEX("#F3BC0F");
        } else {
            choiceResult = settlementResult[SicBoBetType.big] ? GameUtils.getText("ui.choice_big") : GameUtils.getText("ui.choice_small");
            this.result.node.color = settlementResult[SicBoBetType.big] ? color.fromHEX("#FF3131") : color.fromHEX("#2580F1");
        }

        let totalPoints = 0;
        Object.values(result).forEach((point: number) => {
            totalPoints += point;
        });

        this.totalPoints.string = `${totalPoints} -`;
        this.result.string = choiceResult.toUpperCase();
    }
}
