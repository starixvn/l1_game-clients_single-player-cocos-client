import * as _ from "lodash";

import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";
import { HoldemPokerState } from "../event-models/HoldemPokerState";

export const updateStatusGame = (gameData: HoldemPokerGameData) => () => {
    if (gameData.stateModel.state === HoldemPokerState.calling_call) {
        gameData.placeBetModel.rejoinTable(gameData.placeBetModel.previousChoices);
        gameData.stateModel.afterDeal();
    } else if (!_.isEmpty(gameData.placeBetModel.previousChoices)) {
        gameData.stateModel.afterCall();
        gameData.placeBetModel.resetBets();
    } else {
        gameData.stateModel.resetState();
        gameData.placeBetModel.resetBets();
    }
};
