import MiniGameRoundTimer from "../../../mini-games-panel/view-models/MiniGameRoundTimer";
import { BigSmallConfigs } from "./BigSmallConfigs";

const { ccclass } = cc._decorator;

@ccclass
export default class BigSmallRoundTimer extends MiniGameRoundTimer {
    betOptions = ["big", "small"];

    override initGameConfig() {
        this.gameConfig = new BigSmallConfigs();
    }
}
