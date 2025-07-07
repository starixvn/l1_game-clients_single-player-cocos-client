import { formatOdds } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HoldemPokerAnteOddsTable extends cc.Component {
    @property(cc.Label)
    royalFlush: cc.Label = null;

    @property(cc.Label)
    straightFlush: cc.Label = null;

    @property(cc.Label)
    fourOfAKind: cc.Label = null;

    @property(cc.Label)
    fullHouse: cc.Label = null;

    @property(cc.Label)
    flush: cc.Label = null;

    @property(cc.Label)
    straightOrLower: cc.Label = null;

    set RoyalFlush(value: number) {
        this.royalFlush.string = formatOdds(value);
    }

    set StraightFlush(value: number) {
        this.straightFlush.string = formatOdds(value);
    }

    set FourOfAKind(value: number) {
        this.fourOfAKind.string = formatOdds(value);
    }

    set FullHouse(value: number) {
        this.fullHouse.string = formatOdds(value);
    }

    set Flush(value: number) {
        this.flush.string = formatOdds(value);
    }

    set StraightOrLower(value: number) {
        this.straightOrLower.string = formatOdds(value);
    }
}
