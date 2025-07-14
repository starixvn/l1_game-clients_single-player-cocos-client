import MiniGameRoundTimer from "../../../mini-games-panel/view-models/MiniGameRoundTimer";
import { TurboBigSmallConfigs } from "./TurboBigSmallConfigs";

const { ccclass } = cc._decorator;

@ccclass
export default class TurboBigSmallRoundTimer extends MiniGameRoundTimer {
    betOptions = ["big", "small"];

    override initGameConfig() {
        this.gameConfig = new TurboBigSmallConfigs();
    }
}
