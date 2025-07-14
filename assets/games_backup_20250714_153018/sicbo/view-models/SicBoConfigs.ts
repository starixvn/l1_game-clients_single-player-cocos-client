import { GameConfigBase } from "../../_base/view-models/GameConfigBase";

export default class SicBoConfigs implements GameConfigBase {
    minBetTime = 1;
    fullTime = 42;
    betTime = 30;
    stopBetTime = 3;
    waitTime = 5;
}
