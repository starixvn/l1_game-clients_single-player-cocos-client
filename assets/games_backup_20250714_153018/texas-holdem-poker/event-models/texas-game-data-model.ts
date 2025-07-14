import MD5HandlerBase from "../../_casino/event-handlers/MD5HandlerBase";
import CallModelBase from "../../_casino/event-models/CallModelBase";
import DealModelBase from "../../_casino/event-models/DealModelBase";
import HoldModelBase from "../../_casino/event-models/HoldModelBase";
import { HoldemPokerGameData } from "../../holdem-poker/event-models/HoldemPokerGameData";
import TexasAutoSettleHandler from "../event-handlers/texas-auto-settle-handler";
import TexasCallHandler from "../event-handlers/texas-call-handler";
import TexasConfigsHandler from "../event-handlers/texas-configs-handler";
import TexasDealHandler from "../event-handlers/texas-deal-handler";
import TexasFinishHandler from "../event-handlers/texas-finish-handler";
import TexasHoldHandler from "../event-handlers/texas-hold-handler";
import TexasOwnBetHandler from "../event-handlers/texas-own-bet-handler";
import TexasRiverHandler from "../event-handlers/texas-river-handler";
import TexasSwapHandler from "../event-handlers/texas-swap-handler";
import TexasTicketDetailHandler from "../event-handlers/texas-ticket-detail-handler";
import TexasTurnHandler from "../event-handlers/texas-turn-handler";
import { TexasChoicesConst } from "../texas-constants";
import TexasAutoSettleModel from "./texas-auto-settle-model";
import TexasConfigsModel from "./texas-configs-model";
import TexasFinishModel from "./texas-finish-model";
import TexasOwnBetModel from "./texas-own-bet-model";
import TexasPlaceBetModel from "./texas-place-bet-model";
import TexasRiverModel from "./texas-river-model";
import TexasSettlementModel from "./texas-settlement-model";
import TexasStateModel from "./texas-state-model";
import TexasTicketDetailModel from "./texas-ticket-detail-model";
import TexasTurnModel from "./texas-turn-model";

export default class TexasGameDataModel extends HoldemPokerGameData {
    readonly configs: TexasConfigsModel;
    readonly placeBetModel: TexasPlaceBetModel;
    readonly stateModel: TexasStateModel;
    readonly finishModel: TexasFinishModel;
    readonly settlement: TexasSettlementModel;
    readonly ticketDetailModel: TexasTicketDetailModel;
    readonly turnModel: TexasTurnModel;
    readonly riverModel: TexasRiverModel;
    readonly autoSettleModel: TexasAutoSettleModel;
    ownBets: TexasOwnBetModel;

    constructor() {
        super();

        this.configs = new TexasConfigsModel();
        this.placeBetModel = new TexasPlaceBetModel();
        this.stateModel = new TexasStateModel();
        this.settlement = new TexasSettlementModel();
        this.autoSettleModel = new TexasAutoSettleModel();

        this.dealModel = new DealModelBase();
        this.holdModel = new HoldModelBase();
        this.callModel = new CallModelBase();
        this.turnModel = new TexasTurnModel();
        this.riverModel = new TexasRiverModel();
        this.ownBets = new TexasOwnBetModel();
        this.finishModel = new TexasFinishModel();
        this.ticketDetailModel = new TexasTicketDetailModel();
    }

    // Override isProcessingBet
    set isProcessingBet(value: boolean) {
        this.processingBetFlag = value;
        if (!this.processingBetFlag) {
            this.emit(TexasGameDataModel.Events.HIDE_PROCESSING_BET);
        }
    }

    protected handleHandler() {
        const handlers = [
            TexasConfigsHandler,
            TexasAutoSettleHandler,
            TexasDealHandler,
            TexasSwapHandler,
            TexasHoldHandler,
            TexasCallHandler,
            TexasTurnHandler,
            TexasRiverHandler,
            TexasOwnBetHandler,
            TexasFinishHandler,
            MD5HandlerBase,
            TexasTicketDetailHandler
        ];

        this.eventHandlers.push(...handlers.map((Handler) => new Handler(this)));
    }

    protected registerEventHandlers() {
        this.registerBaseEventHandlers();
        this.handleHandler();
    }

    receiveUIData(data: any) {
        if (!!data.bet) {
            this.placeBetModel.isUsingHand = true;
            this.placeBetModel.placeBet(data.bet.choice, data.bet.amount);
            this.stateModel.placeBet(data.bet.choice);
        }
        if (!!data.deal) {
            this.stateModel.deal();
        }
        if (!!data.swap) {
            this.stateModel.swap();
        }
        if (!!data.hold) {
            this.stateModel.hold();
        }
        if (!!data.cancel) {
            this.placeBetModel.resetBets();
            this.stateModel.cancelBet();
        }
        if (!!data.fold) {
            this.stateModel.fold();
        }

        this.checkDouble(data);
        this.checkTurn(data);
        this.checkRiver(data);
        this.checkRebet(data);
        this.checkNew(data);
    }

    protected checkDouble(data: any) {
        if (!!data.double) {
            this.placeBetModel.double(data.double.choice, data.double.amount);
        }
        if (!!data.doubleCall) {
            this.placeBetModel.doubleAndCall(data.doubleCall.amount);
            this.stateModel.call();
        }
    }
    protected checkTurn(data: any) {
        if (!!data.betTurn) {
            this.placeBetModel.updateBetModel(TexasChoicesConst.turnBet, TexasPlaceBetModel.Events.TURN, data.betTurn.amount);
            this.stateModel.turning();
        }
        if (!!data.checkTurn) {
            this.stateModel.checkTurn();
        }
    }
    protected checkRiver(data: any) {
        if (!!data.betRiver) {
            this.placeBetModel.updateBetModel(TexasChoicesConst.riverBet, TexasPlaceBetModel.Events.RIVER, data.betRiver.amount);
            this.stateModel.rivering();
        }
        if (!!data.checkRiver) {
            this.stateModel.checkRiver();
        }
    }
    protected checkRebet(data: any) {
        if (!!data.rebet) {
            this.placeBetModel.rebet();
            this.stateModel.rebet();
        }
        if (!!data.rebetAndDeal) {
            this.placeBetModel.rebetAndDeal();
            this.stateModel.deal();
        }
    }

    protected checkNew(data: any) {
        if (!!data.new) {
            this.placeBetModel.new();
            this.stateModel.resetState();
        }
        if (!!data.replayNew) {
            this.placeBetModel.replayNew(data.replayNew.amount);
            this.stateModel.replayNew();
        }
    }
}
