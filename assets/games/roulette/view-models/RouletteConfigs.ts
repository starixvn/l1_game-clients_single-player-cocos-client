import { GameConfigBase } from "../../_base/view-models/GameConfigBase";

export class RouletteConfigs implements GameConfigBase {
    minBetTime = 1;
    fullTime = 59;
    betTime = 45;
    stopBetTime = 5;
    waitTime = 15;
}
