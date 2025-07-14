import { GameConfigBase } from "../../_base/view-models/GameConfigBase";

export class BigSmallConfigs implements GameConfigBase {
    minBetTime = 1;
    fullTime = 61;
    betTime = 50;
    stopBetTime = 5;
    waitTime = 5;
}
