import { TexasChoicesType } from "../texas-type";
import TexasGameDataModel from "../event-models/texas-game-data-model";
import TexasOwnBetModel from "../event-models/texas-own-bet-model";
import TexasPlaceBetModel from "../event-models/texas-place-bet-model";

export const updatePreviousChoices = (placeBetModel: TexasPlaceBetModel) => (bets: TexasChoicesType) => {
    const anteBet = bets?.anteBet;

    placeBetModel.deal({ anteBet: anteBet });
};

export const showRejoinOwnBets = (gameData: TexasGameDataModel<TexasChoicesType>) => (ownBets: TexasOwnBetModel) => {
    ownBets.bets && gameData.placeBetModel.rejoinTable(ownBets.bets);
};
