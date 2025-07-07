import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KenoHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    big: cc.Label = null;

    @property(cc.Label)
    small: cc.Label = null;

    @property(cc.Label)
    odd: cc.Label = null;

    @property(cc.Label)
    even: cc.Label = null;

    @property(cc.Label)
    gold: cc.Label = null;

    @property(cc.Label)
    wood: cc.Label = null;

    @property(cc.Label)
    water: cc.Label = null;

    @property(cc.Label)
    fire: cc.Label = null;

    @property(cc.Label)
    earth: cc.Label = null;

    setBasicData(betLog: any) {
        const { settlementResult, big, small, odd, even, gold, wood, water, fire, earth } = betLog;

        Object.keys(settlementResult).forEach((key) => {
            if (settlementResult[key]) {
                this[key].node.color = cc.Color.YELLOW;
            }
        });

        this.big.string = numberWithCommas(big);
        this.small.string = numberWithCommas(small);
        this.odd.string = numberWithCommas(odd);
        this.even.string = numberWithCommas(even);
        this.gold.string = numberWithCommas(gold);
        this.wood.string = numberWithCommas(wood);
        this.water.string = numberWithCommas(water);
        this.fire.string = numberWithCommas(fire);
        this.earth.string = numberWithCommas(earth);
    }
}
