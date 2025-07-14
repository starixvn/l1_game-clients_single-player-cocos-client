import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { OldCardModel } from "../../../common/new-card/view-models/NewCard";

export default class TexasAutoSettleModel extends EventEmitterBase {
    static Events = {
        CHANGE: "afterRiver:change"
    };

    dealerCards: OldCardModel[];
    communityCards: OldCardModel[];
    combinationResult: any;
    roundId: number;
    totalAmount: number;
    step: string;

    updateModel(props: {
        dealerCards: OldCardModel[];
        communityCards: OldCardModel[];
        combinationResult: any;
        totalAmount: number;
        step: string;
    }) {
        const { dealerCards, communityCards, combinationResult, totalAmount, step } = props;
        this.dealerCards = dealerCards;
        this.combinationResult = combinationResult;
        this.communityCards = communityCards;
        this.totalAmount = totalAmount;
        this.step = step;
        this.emit(TexasAutoSettleModel.Events.CHANGE, this);
    }
}
