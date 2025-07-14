import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { OldCardModel } from "../../../common/new-card/view-models/NewCard";

export default class TexasRiverModel extends EventEmitterBase {
    static Events = {
        CHANGE: "afterRiver:change"
    };

    dealerCards: OldCardModel[];
    communityCards: OldCardModel[];
    combinationResult: any;
    roundId: number;
    totalAmount: number;

    updateModel(dealerCards: OldCardModel[], communityCards: OldCardModel[], combinationResult: any, totalAmount: number) {
        this.dealerCards = dealerCards;
        this.combinationResult = combinationResult;
        this.communityCards = communityCards;
        this.totalAmount = totalAmount;
        this.emit(TexasRiverModel.Events.CHANGE, this);
    }
}
