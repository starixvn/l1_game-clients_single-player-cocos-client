import TexasGameDataModel from "../event-models/texas-game-data-model";
import { cloneDeepChoiceData } from "../texas-helper";
import TexasEventHandler from "./texas-event-handler";

export type TexasFinish = {
    finish: {
        settlementResult: {
            aa: number;
            ante: number;
            call: number;
        };
        isAutoSettle?: boolean;
    };
};

export default class TexasFinishHandler extends TexasEventHandler<TexasFinish> {
    protected verifyEvent(event: TexasFinish) {
        return !!event.finish;
    }

    protected handle(event: TexasFinish) {
        this.gameData.isProcessingBet = false;
        const { settlementResult, isAutoSettle } = event.finish;
        isAutoSettle && (this.gameData.settlement.autoSettle = true);

        const settlementResultConverted = cloneDeepChoiceData(settlementResult);

        this.gameData.emit(TexasGameDataModel.Events.SETTLED, this);
        this.gameData.finishModel.changeSettlementResult(settlementResultConverted);
    }
}
