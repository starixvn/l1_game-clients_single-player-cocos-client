import GameUtils from "../../../common/GameUtils";
import { BMBetType } from "./BitcoinMasterCommon";
import BitcoinMasterUtils from "./BitcoinMasterUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitcoinMasterEvenOddResultDetail extends cc.Component {
    @property(cc.Label)
    result: cc.Label = null;

    @property(cc.Label)
    number: cc.Label = null;

    evenOddValue = 0;

    setColor() {
        const color = cc.Color.WHITE;
        const convertColor = this.evenOddValue % 2 ? color.fromHEX("#F3485F") : color.fromHEX("#bac5ca");
        this.result.node.color = convertColor;
        this.number.node.color = convertColor;
    }

    setData(result: number) {
        const evenOddValue = parseInt(BitcoinMasterUtils.getEvenOddResult(result));
        this.evenOddValue = evenOddValue;
        const message = evenOddValue % 2 ? GameUtils.getBetChoiceString(BMBetType.Odd) : GameUtils.getBetChoiceString(BMBetType.Even);

        this.result.string = message;
        this.number.string = ` (${evenOddValue})`;
    }
}
