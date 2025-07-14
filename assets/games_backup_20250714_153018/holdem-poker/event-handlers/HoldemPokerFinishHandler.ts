import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";
import HoldemPokerEventHandler from "./HoldemPokerEventHandler";

export type HoldemPokerFinish = {
    finish: {
        settlementResult: {
            aa: number;
            ante: number;
            call: number;
        };
    };
};

export default class HoldemPokerFinishHandler extends HoldemPokerEventHandler<HoldemPokerFinish> {
    protected verifyEvent(event: HoldemPokerFinish) {
        return !!event.finish;
    }

    protected handle(event: HoldemPokerFinish) {
        this.gameData.isProcessingBet = false;
        const { settlementResult } = event.finish;

        this.gameData.emit(HoldemPokerGameData.Events.SETTLED, this);
        this.gameData.finishModel.changeSettlementResult(settlementResult);
    }
}
