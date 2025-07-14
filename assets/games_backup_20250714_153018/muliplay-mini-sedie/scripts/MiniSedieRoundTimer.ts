import MiniGameRoundTimer from "../../../mini-games-panel/view-models/MiniGameRoundTimer";
import { miniSedieConfigs } from "./MiniSedieConfigs";

const { ccclass } = cc._decorator;

@ccclass
export default class MiniSedieRoundTimer extends MiniGameRoundTimer {
    betOptions = ["odd", "even"];

    override initGameConfig() {
        this.gameConfig = miniSedieConfigs[this.gameId];
    }
}
