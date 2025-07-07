import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import { GameConfigHandler } from "../_base_new/handlers/GameConfigHandler";
import { NoticeHandler } from "../_base_new/handlers/NoticeHandler";
import { ResultHashHandler } from "../_base_new/handlers/ResultHashHandler";
import { RoundHistoryHandler } from "../_base_new/handlers/RoundHistoryHandler";
import { SettlemenHandler } from "../_base_new/handlers/SettlementHandler";
import { UMHandler } from "../_base_new/handlers/UMHandler";
import NewGameData from "../_base_new/models/NewGameData";
import { UserProfileModel } from "../_base_new/models/UserProfileModel";
import { TotalBetsEventHandler } from "../_new/_base/game-data-management/event-handlers/total-bets-handler";
import { SoloBetHandler } from "./solo-bet-handler";
import { SoloBetModel } from "./solo-bet-model";

export default class SoloGameData extends NewGameData {
    userProfileModel: UserProfileModel;
    protected initModels() {
        super.initModels();
        this.betModel = new SoloBetModel();
        this.userProfileModel = new UserProfileModel();
    }

    protected initEventEmitters() {
        super.initEventEmitters();

        const models: EventEmitterBase[] = [
            //
            this.userProfileModel
        ];
        this.eventEmitters.push(...models);
    }

    receiveData(data: any) {
        super.receiveData(data);

        if (data?.finish?.roundId) {
            this.changeRoundId(data?.finish?.roundId);
        }
    }

    protected registerBaseEventHandlers() {
        const handlers = [
            // base handlers
            UMHandler,
            ResultHashHandler,
            GameConfigHandler,
            RoundHistoryHandler,
            TotalBetsEventHandler,
            NoticeHandler,
            SettlemenHandler,
            SoloBetHandler

            // more handlers for player and placing chips
            // TableGameBetHandler,
        ];
        this.eventHandlers.push(...handlers.map((Handler) => new Handler(this)));
    }
}
