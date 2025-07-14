import { OldCardModel } from "../../../common/new-card/view-models/NewCard";
import HoldModelBase, { HoldModelType } from "../../_casino/event-models/HoldModelBase";

export interface CasinoHoldemHoldModelType extends HoldModelType {
    communityCards: OldCardModel[];
}

export default class HoldemPokerHoldModel extends HoldModelBase {
    communityCards: OldCardModel[];

    changeDataAfterHold(options: CasinoHoldemHoldModelType) {
        this.communityCards = options.communityCards;
        super.changeDataAfterHold(options);
    }
}
