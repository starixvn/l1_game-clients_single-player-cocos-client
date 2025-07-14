import DealModelBase, { DealModelType } from "../../_casino/event-models/DealModelBase";
import { OldCardModel } from "../../../common/new-card/view-models/NewCard";

interface HoldemPokerDealModelType extends DealModelType {
    communityCards: OldCardModel[];
    combinationResult: {
        player: {
            id: number;
            combinationCards: OldCardModel[];
            cards: OldCardModel[];
        };
    };
}
export class HoldemPokerAfterDealModel extends DealModelBase {
    communityCards: OldCardModel[];
    combinationResult: any;

    changeDataAfterDeal(options: HoldemPokerDealModelType) {
        this.communityCards = options.communityCards;
        this.combinationResult = options.combinationResult;
        super.changeDataAfterDeal(options);
    }
}
