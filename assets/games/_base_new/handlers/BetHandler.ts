import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

type Choices = any;
export type BetEventType = {
    ownBets: Choices;
    endBet: number;
    betPercentage: any;
    betChoice: string;
    chips?: any;
    gameConfigs?: any;
    ownChip?: any;
    playerChip?: any;
    rebet?: any;
    userBetPercentage: any;
};

export class BetHandler extends BaseEventHandler<BetEventType> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: BetEventType) {
        return (
            !!event.ownBets ||
            !!event.ownChip ||
            !!event.endBet ||
            !!event.betPercentage ||
            !!event.chips ||
            !!event.rebet ||
            !!event.userBetPercentage
        );
    }

    protected handle(event: BetEventType) {
        if (event.endBet) {
            if (event.endBet === -1) {
                this.gameData.betModel.placeBetFailed();
            } else {
                this.gameData.betModel.placeBetSuccess(event.endBet);
                this.gameData.betModel.flyOwnChipFake({ endBet: event.endBet, betChoice: event.betChoice });
            }
        }

        if (event.ownBets) {
            this.gameData.betModel.changeOwnBets(event.ownBets);
            const isInGamePackage = event.gameConfigs !== undefined;
            if (isInGamePackage) {
                this.gameData.betModel.changeOwnChipsFake(event.ownBets);
                this.gameData.betModel.initOwnChipsByOwnBets(event.ownBets);
            }
        }

        if (event.betPercentage || event.userBetPercentage) {
            this.gameData.betModel.changeBetPercentage(event.betPercentage || event.userBetPercentage);
        }

        if (event.rebet) {
            this.gameData.betModel.handleRebet(event.rebet);
        }
    }
}
