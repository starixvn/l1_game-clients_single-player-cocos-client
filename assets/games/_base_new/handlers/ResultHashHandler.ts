import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import NewGameData from "../models/NewGameData";

export type ResultHashType = {
    resultHash: any;
};

export class ResultHashHandler extends BaseEventHandler<ResultHashType> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: ResultHashType) {
        return event.resultHash != null;
    }

    protected handle(event: ResultHashType) {
        const data = event.resultHash;
        const changeLater =
            this.gameData.durations.isBeingSpecificPhase(Durations.Events.STARTING_ROUND) ||
            this.gameData.durations.isBeingSpecificPhase(Durations.Events.WAITING);
        if (!!data.rawValue || changeLater) {
            this.gameData.resultHash.changeLater(data);
        } else {
            this.gameData.resultHash.change(data);
        }
    }
}
