import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HoldemPokerMinMaxTable extends cc.Component {
    @property(cc.Label)
    min: cc.Label = null;

    @property(cc.Label)
    max: cc.Label = null;

    set Min(value: number) {
        this.min.string = numberWithCommas(value);
    }
    
    set Max(value: number) {
        this.max.string = numberWithCommas(value);
    }
}
