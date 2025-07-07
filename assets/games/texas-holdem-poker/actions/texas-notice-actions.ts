import { TexasState, TexasChoicesType } from "../texas-type";
import TexasGameDataModel from "./../event-models/texas-game-data-model";

export const updateStatusGame = (gameData: TexasGameDataModel<TexasChoicesType>) => () => {
    switch (gameData.stateModel.state) {
        case TexasState.calling_call:
            gameData.placeBetModel.rejoinTable(gameData.placeBetModel.previousChoices);
            gameData.stateModel.holdSuccess();
            break;
        case TexasState.calling_turning:
            const choicesTurn = gameData.placeBetModel.choices;
            delete choicesTurn.turnBet;
            gameData.placeBetModel.rejoinTable(choicesTurn);
            gameData.stateModel.callSuccess();
            break;
        case TexasState.calling_rivering:
            const choicesRiver = gameData.placeBetModel.choices;
            delete choicesRiver.riverBet;
            gameData.placeBetModel.rejoinTable(choicesRiver);
            gameData.stateModel.turnSuccess();
            break;
        case TexasState.calling_check_turn:
            gameData.stateModel.checkTurn();
            break;
        case TexasState.calling_check_river:
            gameData.stateModel.checkRiver();
            break;

        default:
            gameData.stateModel.resetState();
            gameData.placeBetModel.resetBets();
            break;
    }
};
