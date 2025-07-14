import MiniGameRoundTimer from "../../../mini-games-panel/view-models/MiniGameRoundTimer";
import { TurboBigSmallConfigs } from "../../turbo-bigsmall/view-models/TurboBigSmallConfigs";

const { ccclass } = cc._decorator;

@ccclass
export default class TurboOddEvenRoundTimer extends MiniGameRoundTimer {
    betOptions = ["odd", "even"];

    override initGameConfig() {
        this.gameConfig = new TurboBigSmallConfigs();
    }
}
