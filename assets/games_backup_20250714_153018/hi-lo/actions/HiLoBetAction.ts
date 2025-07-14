import { HiLoState } from "../events-models/HiLoState";
import { HiLoStateModel } from "../events-models/HiLoStateModel";
import HiLo from "../view-models/HiLo";

export const handleGameState = (mainGame: HiLo) => (stateModel: HiLoStateModel) => {
    mainGame.showProcessingWarning(false);

    switch (stateModel.state) {
        case HiLoState.BLANK_NEW:
            mainGame.resetUIBlankNewState();
            break;

        case HiLoState.IN_TURN:
            mainGame.showPlayGameButton(false);
            mainGame.betBoardComp.disableBetBoard(true);
            mainGame.isStopSchedule = false;
            break;

        case HiLoState.SETTLED:
            mainGame.showPlayGameButton(false);
            mainGame.betBoardComp.disableBetBoard(true);
            break;
    }
};
