import HiLoGameConfigs from "../events-models/HiLoGameConfigs";
import HiLo from "../view-models/HiLo";

export const updateGameConfigs = (mainGame: HiLo) => (configs: HiLoGameConfigs) => {
    mainGame.betBoardComp.gameConfigs = configs.gameConfigs;
    mainGame.betBoardComp.setChipValues(configs.gameConfigs);
};
