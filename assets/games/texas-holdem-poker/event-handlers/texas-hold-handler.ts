import { CasinoHoldDataType } from "../../_casino/event-models/CasinoDataType";
import TexasEventHandler from "./texas-event-handler";

export default class TexasHoldHandler extends TexasEventHandler<CasinoHoldDataType> {
    protected verifyEvent(event: CasinoHoldDataType) {
        return !!event.hold;
    }

    protected handle(event: CasinoHoldDataType) {
        const { player, roundId, combinationResult } = event.hold;
        this.gameData.stateModel.holding();
        this.gameData.holdModel.changeDataAfterHold({ playerCards: player, combinationResult, roundId });
    }
}
