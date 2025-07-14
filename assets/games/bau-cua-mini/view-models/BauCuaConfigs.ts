import { GameConfigBase } from "../../_base/view-models/GameConfigBase";

export class BauCuaConfigs implements GameConfigBase {
    minBetTime = 1;
    fullTime = 40;
    betTime = 30;
    stopBetTime = 5;
    waitTime = 10;
}
