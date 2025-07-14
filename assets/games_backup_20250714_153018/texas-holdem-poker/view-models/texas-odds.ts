import { formatOdds } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TexasOdds extends cc.Component {
    @property(cc.Label)
    oddName: cc.Label = null;

    @property(cc.Label)
    oddValue: cc.Label = null;

    @property()
    key = "";

    set OddValue(value: number) {
        try {
            this.oddValue.string = formatOdds(value);
        } catch (error) {
            console.log("oddName, oddValue, key", this.oddName, this.oddValue, this.key);
        }
    }
}
