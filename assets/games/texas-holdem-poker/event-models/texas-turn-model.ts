import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { OldCardModel } from "../../../common/new-card/view-models/NewCard";

export default class TexasTurnModel extends EventEmitterBase {
    static Events = {
        CHANGE: "afterTurn:change"
    };

    communityCards: OldCardModel[];
    combinationResult: any;
    roundId: number;
    totalAmount: number;

    updateModel(communityCards: OldCardModel[], combinationResult: any, totalAmount: number) {
        this.combinationResult = combinationResult;
        this.communityCards = communityCards;
        this.totalAmount = totalAmount;
        this.emit(TexasTurnModel.Events.CHANGE, this);
    }
}
