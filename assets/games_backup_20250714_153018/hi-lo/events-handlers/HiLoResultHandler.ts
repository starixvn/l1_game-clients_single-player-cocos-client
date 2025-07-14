import { BetType } from "../events-models/HiLoOwnBetsModel";
import { HiLoResultModel } from "../events-models/HiLoResultModel";
import HiLoEventHandler from "./HiLoEventHandler";

export type HiLoResultType = {
    result: BetType;
};

export class HiLoResultHandler extends HiLoEventHandler<HiLoResultType> {
    protected verifyEvent(data: HiLoResultType) {
        return !!data.result;
    }

    protected handle(data: HiLoResultType) {
        this.gameData.resultModel.change(data.result, HiLoResultModel.Events.CHANGE);
        this.gameData.stateModel.inTurn();
        this.gameData.durations.remaining = data.result.remainingTime;
        this.gameData.roundCounter.change(data.result.roundId);
    }
}
