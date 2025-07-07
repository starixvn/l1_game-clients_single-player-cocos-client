import MiniGameRoundTimer from "../../../mini-games-panel/view-models/MiniGameRoundTimer";
import { RongHoConfigs } from "./RongHoConfigs";

const { ccclass } = cc._decorator;

@ccclass
export default class DragonTigerRoundTimer extends MiniGameRoundTimer {
    betOptions = ["dragon", "tiger", "tie"];

    override initGameConfig() {
        this.gameConfig = new RongHoConfigs();
    }
}
