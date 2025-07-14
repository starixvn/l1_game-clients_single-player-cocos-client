import CascadingSlotBase from "../view-models/CascadingSlotBase";
import { CascadingSlotConfigData } from "./../models/CascadingSlotConfigModel";

export const handleBetControl = (mainGame: CascadingSlotBase) => (data: CascadingSlotConfigData) => {
    mainGame.betControl.onSetData(
        {
            coinValues: data.coinValues,
            betLevels: data.betLevels,
            betMultiplier: data.betMultiplier,
            defaultCoinValue: data.defaultCoinValue
        },
        mainGame.gameData.placeBetModel,
        mainGame.gameData.uiModel
    );
};
