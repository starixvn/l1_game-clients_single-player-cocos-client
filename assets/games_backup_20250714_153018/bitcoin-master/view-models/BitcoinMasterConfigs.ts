import { GameConfigBase } from "../../_base/view-models/GameConfigBase";

export class BitcoinMasterConfigs implements GameConfigBase {
    minBetTime = 61;
    fullTime = 120;
    betTime = 105;
    stopBetTime = 65;
    waitTime = 15;
}
