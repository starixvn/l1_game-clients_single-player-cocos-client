import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import { TimeEventHandler } from "../../_new/_base/game-data-management/event-handlers/time-handler";
import { TotalBetsEventHandler } from "../../_new/_base/game-data-management/event-handlers/total-bets-handler";
import { GameData } from "../../_new/_base/game-data-management/models/game-data";
import { BetDetailsUrlHandler } from "../handlers/BetDetailsUrlHandler";
import { BetHandler } from "../handlers/BetHandler";
import { GameConfigHandler } from "../handlers/GameConfigHandler";
import { MultiplierHandler } from "../handlers/MultiplierHandler";
import { NoticeHandler } from "../handlers/NoticeHandler";
import { OddsHandler } from "../handlers/OddsHandler";
import { ResultHashHandler } from "../handlers/ResultHashHandler";
import { RoundHistoryHandler } from "../handlers/RoundHistoryHandler";
import { SettlemenHandler } from "../handlers/SettlementHandler";
import { UMHandler } from "../handlers/UMHandler";
import { BetDetailsUrl } from "./BetDetailsUrl";
import { BetModel } from "./BetModel";
import { BoostedChoicesModel } from "./BoostedChoicesModel";
import { BoostedOddsModel } from "./BoostedOddsModel";
import { GameConfigs } from "./GameConfigs";
import { Multiplier } from "./Multiplier";
import { NewDurations } from "./NewDurations";
import { NoticeModel } from "./NoticeModel";
import { ResultHash } from "./ResultHash";
import { RoundHistory } from "./RoundHistory";
import { Settlement } from "./Settlement";
import { UMModel } from "./UMModel";

export default class NewGameData extends GameData {
    static Events = {
        CHANGE_ROUND_ID: "NewGameData:CHANGE_ROUND_ID",
        CHANGE_STATUS_SHOW_STATISTIC: "NewGameData:CHANGE_STATUS_SHOW_STATISTIC"
    };

    protected readonly eventEmitters: EventEmitterBase[] = [];
    protected readonly eventHandlers: BaseEventHandler<any>[] = [];

    betModel: BetModel;
    gameConfigs: GameConfigs;
    notice: NoticeModel;
    roundHistory: RoundHistory;
    settlement: Settlement;
    resultHash: ResultHash;
    umModel: UMModel;
    durations: NewDurations;
    boostedChoicesModel: BoostedChoicesModel;
    boostedOddsModel: BoostedOddsModel;
    multiplier: Multiplier;
    betDetailsUrl: BetDetailsUrl;
    roundId: number;

    constructor() {
        super();

        this.initModels();
        this.initEventEmitters();
    }

    protected initEventEmitters() {
        const models: EventEmitterBase[] = [
            //
            this.umModel,
            this.durations,
            this.totalBets,
            this.betModel,
            this.gameConfigs,
            this.notice,
            this.roundHistory,
            this.settlement,
            this.resultHash,
            this.boostedChoicesModel,
            this.boostedOddsModel,
            this.multiplier,
            this.betDetailsUrl
        ];
        this.eventEmitters.push(...models);
    }

    protected initModels() {
        this.durations = new NewDurations();
        this.betModel = new BetModel();
        this.gameConfigs = new GameConfigs();
        this.notice = new NoticeModel();
        this.roundHistory = new RoundHistory();
        this.settlement = new Settlement();
        this.resultHash = new ResultHash();
        this.umModel = new UMModel();
        this.boostedChoicesModel = new BoostedChoicesModel();
        this.boostedOddsModel = new BoostedOddsModel();
        this.multiplier = new Multiplier();
        this.betDetailsUrl = new BetDetailsUrl();
    }

    changeRoundId(roundId: number) {
        if (this.roundId === roundId) {
            return;
        }
        this.roundId = roundId;
        this.emit(NewGameData.Events.CHANGE_ROUND_ID, this.roundId);
    }

    updateUI() {
        this.emit(NewGameData.Events.CHANGE_ROUND_ID, this.roundId);
        this.eventEmitters.forEach((emitter) => emitter.updateUI());
    }

    protected registerBaseEventHandlers() {
        const handlers = [
            //
            UMHandler,
            ResultHashHandler,
            MultiplierHandler,
            TimeEventHandler,
            GameConfigHandler,
            RoundHistoryHandler,
            TotalBetsEventHandler,
            BetHandler,
            NoticeHandler,
            SettlemenHandler,
            OddsHandler,
            BetDetailsUrlHandler
        ];
        this.eventHandlers.push(...handlers.map((Handler) => new Handler(this)));
    }

    changeStatusShowStatistic(status) {
        this.emit(NewGameData.Events.CHANGE_STATUS_SHOW_STATISTIC, status);
    }

    clearData() {
        super.clearData();
        this.roundId = -1;
    }
}
