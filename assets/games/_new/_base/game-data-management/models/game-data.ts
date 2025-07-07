import EventEmitterBase from "../../../../../common/emitter/EventEmitterBase";
import { UserHandler } from "../../../common/user-manager/view-models/UserHandler";
import { APIErrorHandler } from "../event-handlers/api-error-handler";
import { BaseEventHandler } from "../event-handlers/base-handler";
import { PlaceBetNoticeEventHandler } from "../event-handlers/place-bet-notice-handler";
import { TimeEventHandler } from "../event-handlers/time-handler";
import { TotalBetsEventHandler } from "../event-handlers/total-bets-handler";
import { CommonEvents } from "./common-events";
import { Durations } from "./durations";
import { TotalBets } from "./total-bets";

export class GameData extends EventEmitterBase {
    protected readonly eventEmitters: EventEmitterBase[] = [];
    protected readonly eventHandlers: BaseEventHandler<any>[] = [];

    protected processingBetFlag = false;
    private underMaintenanceFlag = false;
    gotIngameData = false;

    durations: Durations;
    readonly totalBets: TotalBets;
    readonly userHandler: UserHandler;
    md5Data: any;
    betModel: any;
    settlement: any;
    gameConfigs: any;

    get isUnderMaintenance() {
        return this.underMaintenanceFlag;
    }

    set isUnderMaintenance(value: boolean) {
        this.underMaintenanceFlag = !!value;

        if (!this.underMaintenanceFlag) {
            this.emit(CommonEvents.END_UM);
        }
    }

    get isProcessingBet() {
        return this.processingBetFlag;
    }

    set isProcessingBet(value: boolean) {
        this.processingBetFlag = value;
    }

    constructor() {
        super();
        this.durations = new Durations();
        this.totalBets = new TotalBets();
        this.userHandler = UserHandler.getInstance();
    }

    protected registerEventHandlers() {
        this.registerBaseEventHandlers();
    }

    protected registerBaseEventHandlers() {
        const handlers = [APIErrorHandler, TimeEventHandler, TotalBetsEventHandler, PlaceBetNoticeEventHandler];

        this.eventHandlers.push(...handlers.map((Handler) => new Handler(this)));
    }

    receiveData(data: unknown) {
        if (!this.eventHandlers.length) {
            this.registerEventHandlers();
        }

        this.eventHandlers.forEach((handler) => handler.onReceiveEvent(data));
    }

    updateUserBalance(balance?: number) {
        this.userHandler?.updateBalance(balance);
    }

    clearData() {
        this.betModel?.clearData();
        this.totalBets?.clearData();
        this.settlement?.clearSettlement();
        this.settlement?.clearStatus();
        this.settlement?.clearWinnersData();
        this.underMaintenanceFlag = false;
    }
}
