import { formatOdds } from "../../../common/helpers/NumberHelper";
import HoldemPokerAnteOddsTable from "./HoldemPokerAnteOddsTable";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HoldemPokerAaOddsTable extends HoldemPokerAnteOddsTable {
    @property(cc.Label)
    pairOfAcesOrHigher: cc.Label = null;

    set PairOfAcesOrHigher(value: number) {
        this.pairOfAcesOrHigher.string = formatOdds(value);
    }
}
