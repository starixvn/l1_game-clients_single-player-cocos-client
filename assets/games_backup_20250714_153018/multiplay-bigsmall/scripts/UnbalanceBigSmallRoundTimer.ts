import MiniGameRoundTimer from "../../../mini-games-panel/view-models/MiniGameRoundTimer";
import { unbalancedBigSmallConfigs } from "./UnbalancedBigSmallConfig";

const { ccclass } = cc._decorator;

@ccclass
export default class UnbalanceBigSmallRoundTimer extends MiniGameRoundTimer {
    betOptions = ["big", "small"];

    override initGameConfig() {
        this.gameConfig = unbalancedBigSmallConfigs[this.gameId];
    }
}
