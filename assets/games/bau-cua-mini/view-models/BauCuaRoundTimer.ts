import MiniGameRoundTimer from "../../../mini-games-panel/view-models/MiniGameRoundTimer";
import { BauCuaConfigs } from "./BauCuaConfigs";

const { ccclass } = cc._decorator;

@ccclass
export default class BauCuaRoundTimer extends MiniGameRoundTimer {
    betOptions = ["crab", "fish", "gourd", "prawn", "rooster", "stag"];

    override initGameConfig() {
        this.gameConfig = new BauCuaConfigs();
    }
}
