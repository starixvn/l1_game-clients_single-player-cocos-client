import { formatOdds } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoOddsItem extends cc.Component {
    @property(cc.Label)
    odds: cc.Label = null;

    setValue(value: string) {
        this.odds.string = formatOdds(value);
    }
}
