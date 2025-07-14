import CallModelBase, { CallModelBaseType } from "../../_casino/event-models/CallModelBase";
import { OldCardModel } from "../../../common/new-card/view-models/NewCard";

export interface CasinoHoldemCallModelBaseType extends CallModelBaseType {
    dealerCards: OldCardModel[];
}

export class HoldemPokerAfterCallModel extends CallModelBase {
    dealerCards: OldCardModel[];

    changeDataAfterCall(options: CasinoHoldemCallModelBaseType) {
        this.dealerCards = options.dealerCards;
        super.changeDataAfterCall(options);
    }
}
