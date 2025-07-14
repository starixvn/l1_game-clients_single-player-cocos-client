import { CasinoSwapDataType } from "../../_casino/event-models/CasinoDataType";
import HoldemPokerEventHandler from "./HoldemPokerEventHandler";

export default class HoldemPokerSwapHandler extends HoldemPokerEventHandler<CasinoSwapDataType> {
    protected verifyEvent(event: CasinoSwapDataType) {
        return !!event.swap;
    }

    protected handle(event: CasinoSwapDataType) {
        const { player, combinationResult, roundId } = event.swap;
        this.gameData.stateModel.swapping();
        this.gameData.swapModel.changeDataAfterSwap(player, combinationResult, roundId);
    }
}
