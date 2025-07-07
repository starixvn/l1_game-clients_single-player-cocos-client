import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { OldCardModel } from "../../../common/new-card/view-models/NewCard";

export interface CallModelBaseType {
    communityCards: OldCardModel[];
    combinationResult: any;
    totalAmount: number;
}

export default class CallModelBase extends EventEmitterBase {
    static Events = {
        CHANGE: "afterCall:change"
    };

    communityCards: OldCardModel[];
    combinationResult: any;
    totalAmount: number;

    changeDataAfterCall(options: CallModelBaseType) {
        const { communityCards, combinationResult, totalAmount } = options;
        this.combinationResult = combinationResult;
        this.communityCards = communityCards;
        this.totalAmount = totalAmount;
        this.emit(CallModelBase.Events.CHANGE, this);
    }
}
