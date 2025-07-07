import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { TimeEventHandler } from "../../_new/_base/game-data-management/event-handlers/time-handler";
import { TotalBetsEventHandler } from "../../_new/_base/game-data-management/event-handlers/total-bets-handler";
import { GameConfigHandler } from "../handlers/GameConfigHandler";
import { NoticeHandler } from "../handlers/NoticeHandler";
import PlayerHandler from "../handlers/PlayerHandler";
import { ResultHashHandler } from "../handlers/ResultHashHandler";
import { RoundHistoryHandler } from "../handlers/RoundHistoryHandler";
import { SettlemenHandler } from "../handlers/SettlementHandler";
import { TableGameBetHandler } from "../handlers/TableGameBetHandler";
import { UMHandler } from "../handlers/UMHandler";
import NewGameData from "./NewGameData";
import PlayerModel from "./PlayerModel";
import { UserProfileModel } from "./UserProfileModel";

export default class NewTableGameData extends NewGameData {
    playerModel: PlayerModel;
    userProfileModel: UserProfileModel;

    protected initModels() {
        super.initModels();
        this.playerModel = new PlayerModel();
        this.userProfileModel = new UserProfileModel();
    }

    protected initEventEmitters() {
        super.initEventEmitters();

        const models: EventEmitterBase[] = [
            //
            this.playerModel,
            this.userProfileModel
        ];
        this.eventEmitters.push(...models);
    }

    protected registerBaseEventHandlers() {
        const handlers = [
            // base handlers
            UMHandler,
            ResultHashHandler,
            TimeEventHandler,
            GameConfigHandler,
            RoundHistoryHandler,
            TotalBetsEventHandler,
            NoticeHandler,
            SettlemenHandler,

            // more handlers for player and placing chips
            TableGameBetHandler,
            PlayerHandler
        ];
        this.eventHandlers.push(...handlers.map((Handler) => new Handler(this)));
    }
}
