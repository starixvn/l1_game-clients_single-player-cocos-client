import { GameConfigBase } from "../../_base/view-models/GameConfigBase";

export class BaccaratConfigs implements GameConfigBase {
    minBetTime = 1;
    fullTime = 45;
    betTime = 30;
    stopBetTime = 3;
    waitTime = 20;
}
