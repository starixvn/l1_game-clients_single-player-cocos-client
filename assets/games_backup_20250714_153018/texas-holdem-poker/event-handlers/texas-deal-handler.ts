import TexasGameDataModel from "../event-models/texas-game-data-model";
import { convertChoices } from "../texas-helper";
import TexasEventHandler from "./texas-event-handler";

export type TexasDeal = {
    deal: {
        choices: Record<string, number>;
        roundId: number;
        totalAmount: number;
    };
};

export default class TexasDealHandler extends TexasEventHandler<TexasDeal> {
    protected verifyEvent(event: TexasDeal) {
        return !!event.deal;
    }

    protected handle(event: TexasDeal) {
        const { roundId, choices } = event.deal;
        const choiceProcess = convertChoices({ ante: choices.ante });

        this.gameData.placeBetModel.updateDeal(choiceProcess);
        this.gameData.stateModel.dealing();
        this.gameData.ownBets.updateRoundId(roundId);
        this.gameData.dealModel.changeDataAfterDeal({ roundId });
        this.gameData.emit(TexasGameDataModel.Events.CHOICES_RESULT, choiceProcess);
    }
}
