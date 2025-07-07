import { GameData } from "../../_new/_base/game-data-management/models/game-data";
import { HiLoGameConfigsHandler } from "../events-handlers/HiLoGameConfigsHandler";
import { HiLoOwnBetHandler } from "../events-handlers/HiLoOwnBetHandler";
import { HiLoResultHandler } from "../events-handlers/HiLoResultHandler";
import { HiLoStatusHandler } from "../events-handlers/HiLoStatusHandler";
import HiLo from "../view-models/HiLo";
import HiLoGameConfigs from "./HiLoGameConfigs";
import { HiLoOwnBetsModel } from "./HiLoOwnBetsModel";
import { HiLoResultModel } from "./HiLoResultModel";
import { HiLoRoundCounter } from "./HiLoRoundCounter";
import { HiLoStateModel } from "./HiLoStateModel";
import { HiLoStatusModel } from "./HiLoStatusModel";

export default class HiLoGameData extends GameData {
    static Events = {
        CHANGE_STATE: "changeState",
        SHOW_PROCESSING_BET: "showProcessingBet",
        HIDE_PROCESSING_BET: "hideProcessingBet",
        SETTLED: "settled"
    };

    readonly roundCounter: HiLoRoundCounter;
    readonly configs: HiLoGameConfigs;
    readonly ownBetsModel: HiLoOwnBetsModel;
    readonly resultModel: HiLoResultModel;
    readonly statusModel: HiLoStatusModel;
    readonly stateModel: HiLoStateModel;

    constructor(mainGame: HiLo) {
        super();
        this.roundCounter = new HiLoRoundCounter();
        this.ownBetsModel = new HiLoOwnBetsModel();
        this.resultModel = new HiLoResultModel();
        this.statusModel = new HiLoStatusModel();
        this.stateModel = new HiLoStateModel();
        this.configs = new HiLoGameConfigs();
    }

    protected registerEventHandlers() {
        const handlers = [HiLoGameConfigsHandler, HiLoOwnBetHandler, HiLoResultHandler, HiLoStatusHandler];
        this.eventHandlers.push(...handlers.map((Handler) => new Handler(this)));
    }
}
