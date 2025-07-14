import { CasinoHoldDataType } from "../../_casino/event-models/CasinoDataType";
import HoldemPokerEventHandler from "./HoldemPokerEventHandler";

export default class HoldemPokerHoldHandler extends HoldemPokerEventHandler<CasinoHoldDataType> {
    protected verifyEvent(event: CasinoHoldDataType) {
        return !!event.hold;
    }

    protected handle(event: CasinoHoldDataType) {
        const { player, roundId, combinationResult, communityCards } = event.hold;
        this.gameData.stateModel.holding();

        const data = { playerCards: player, combinationResult, roundId, communityCards };
        this.gameData.holdModel.changeDataAfterHold(data);
    }
}
