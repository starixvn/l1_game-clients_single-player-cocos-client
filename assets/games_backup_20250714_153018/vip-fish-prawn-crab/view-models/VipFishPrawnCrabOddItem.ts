import { formatOdds } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VipFishPrawnCrabOddItem extends cc.Component {
    @property(cc.Label)
    value: cc.Label = null;

    setValue(value: string) {
        this.value.string = formatOdds(value);
    }
}
