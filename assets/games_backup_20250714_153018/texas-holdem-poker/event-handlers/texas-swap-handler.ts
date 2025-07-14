import { CasinoSwapDataType } from "../../_casino/event-models/CasinoDataType";
import TexasEventHandler from "./texas-event-handler";

export default class TexasSwapHandler extends TexasEventHandler<CasinoSwapDataType> {
    protected verifyEvent(event: CasinoSwapDataType) {
        return !!event.swap;
    }

    protected handle(event: CasinoSwapDataType) {
        const { player, combinationResult, roundId } = event.swap;
        this.gameData.stateModel.swapping();
        this.gameData.swapModel.changeDataAfterSwap(player, combinationResult, roundId);
    }
}
