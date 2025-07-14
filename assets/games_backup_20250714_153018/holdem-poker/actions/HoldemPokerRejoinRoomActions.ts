import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";
import { HoldemPokerOwnBet } from "../event-models/HoldemPokerOwnBet";
import { HoldemPokerPlaceBetModel } from "../event-models/HoldemPokerPlaceBetModel";

export const showRejoinOwnBets = (gameData: HoldemPokerGameData) => (ownBets: HoldemPokerOwnBet) => {
    gameData.placeBetModel.rejoinTable(ownBets.bets);
};

export const showRejoinTotalBet = (totalBetLabel: cc.Label) => (ownBets: HoldemPokerOwnBet) => {
    totalBetLabel.string = numberWithCommas(ownBets.totalAmount);
};

export const updatePreviousChoices = (placeBetModel: HoldemPokerPlaceBetModel) => (bets: any) => {
    const ante = bets?.ante;
    const aa = bets?.aa;

    placeBetModel.deal({ ante: ante, aa: aa });
};
