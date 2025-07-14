import AudioManager from "../../../common/audio/AudioManager";
import NewButton from "../../../common/custom-button/NewButton";
import CasinoGame from "../../_casino/CasinoGame";
import { MD5ModelBase } from "../../_casino/event-models/MD5ModelBase";
import SwapModelBase from "../../_casino/event-models/SwapModelBase";
import { CommonEvents } from "../../_new/_base/game-data-management/models/common-events";
import { BettingAreaEvents } from "../../_new/common/betting-area/BettingArea";
import { events } from "../../_new/connection/SocketIOConnection";
import { updateAaOdds, updateAnteOdds, updateMinMax } from "../actions/HoldemPokerConfigActions";
import { handleMD5, updateMD5 } from "../actions/HoldemPokerMD5Action";
import { updateStatusGame } from "../actions/HoldemPokerNoticeActions";
import {
    clearAllBetChips,
    clearBetChips,
    prepareNewRound,
    showHideButtons,
    showHideClearIcon,
    showHideTooltip,
    showOwnBet,
    showPlaceBetChips,
    showSlidingChipWithProcessingFail,
    updateAllChips,
    updateChips,
    updateTotalBetLabel
} from "../actions/HoldemPokerPlaceBetActions";
import { showRejoinOwnBets, showRejoinTotalBet, updatePreviousChoices } from "../actions/HoldemPokerRejoinRoomActions";
import { updateRoundId } from "../actions/HoldemPokerRoundCounterActions";
import { showWinningOption } from "../actions/HoldemPokerSettlementActions";
import { renderTicketDetail } from "../actions/HoldemPokerTicketDetailActions";
import { handleUM } from "../actions/HoldemPokerUmAction";
import {
    collectCards,
    dealPlayerAndDealerCards,
    dealPlayerAndDealerCardsWithoutSwap,
    holdPlayerAndDealerCards,
    rawCardAfterClickCall,
    rawCardWhenRejoin,
    swapPlayerAndDealerCards
} from "../components/cards/view-models/CardWrapper";
import HoldemPokerCards from "../components/cards/view-models/HoldemPokerCards";
import { HoldemPokerAfterCallModel } from "../event-models/HoldemPokerAfterCallModel";
import { HoldemPokerAfterDealModel } from "../event-models/HoldemPokerAfterDealModel";
import { HoldemPokerChoicesConst } from "../event-models/HoldemPokerChoices";
import { HoldemPokerConfigs } from "../event-models/HoldemPokerConfigs";
import { HoldemPokerFinishModel } from "../event-models/HoldemPokerFinishModel";
import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";
import HoldemPokerHoldModel from "../event-models/HoldemPokerHoldModel";
import { HoldemPokerOwnBet } from "../event-models/HoldemPokerOwnBet";
import { HoldemPokerPlaceBetModel } from "../event-models/HoldemPokerPlaceBetModel";
import { HoldemPokerRoundCounter } from "../event-models/HoldemPokerRoundCounter";
import { HoldemPokerSettlement } from "../event-models/HoldemPokerSettlement";
import { HoldemPokerStateModel } from "../event-models/HoldemPokerStateModel";
import { HoldemPokerTicketDetailModel } from "../event-models/HoldemPokerTicketDetailModel";
import HoldemPokerAaOddsTable from "./HoldemPokerAaOddsTable";
import HoldemPokerAnteOddsTable from "./HoldemPokerAnteOddsTable";
import HoldemPokerBettingArea from "./HoldemPokerBettingArea";
import HoldemPokerChips from "./HoldemPokerChips";
import HoldemPokerMinMaxTable from "./HoldemPokerMinMaxTable";
import HoldemPokerPlacingBet from "./HoldemPokerPlacingBet";

export const HoldemPokerId = 39;

const { ccclass, property } = cc._decorator;
@ccclass
export default class HoldemPoker extends CasinoGame {
    @property({ type: [cc.Component] })
    protected bettingAreas: HoldemPokerBettingArea[] = [];

    @property(cc.Node)
    doubleAndCallButton: cc.Node = null;

    @property({ type: HoldemPokerMinMaxTable })
    protected minMaxTable: HoldemPokerMinMaxTable = null;

    @property({ type: HoldemPokerAnteOddsTable })
    protected anteOddsTable: HoldemPokerAnteOddsTable = null;

    @property({ type: HoldemPokerAaOddsTable })
    protected aaOddsTable: HoldemPokerAaOddsTable = null;

    private placingBet: HoldemPokerPlacingBet = null;
    private holdemPokerChips: HoldemPokerChips;
    private gameData: HoldemPokerGameData = null;
    pokerCardScript: HoldemPokerCards = undefined;

    constructor() {
        super();
        this.gameId = HoldemPokerId;
    }

    onLoad() {
        this.gameData = new HoldemPokerGameData();
        this.holdemPokerChips = new HoldemPokerChips();
        super.onLoad();
        this.initGeneralEvents();
    }

    initGeneralEvents() {
        this.initPlacingBet();
        this.initBettingAreas();
        this.initButtonStatus();

        this.registerBettingAreasEvents();
        this.registerPlaceBetEvents();
        this.registerConfigsEvents();
        this.registerStateEvents();
        this.registerAfterDealEvents();
        this.registerAfterSwapEvents();
        this.registerAfterHoldEvents();
        this.registerAfterCallEvents();
        this.registerBetEvents();
        this.registerSettlementEvents();
        this.initPokerCardScript();
        this.registerRoundCounterEvents();
        this.registerNoticeEvents();
        this.registerTicketDetailEvents();
        this.registerMD5Event();
    }

    initPokerCardScript() {
        this.pokerCardScript = this.node.getChildByName("PokerCardScript").getComponent(HoldemPokerCards);
    }

    checkShowUmMessage(data: any) {
        return true;
    }

    private initPlacingBet() {
        this.placingBet = new HoldemPokerPlacingBet(this.gameData, this.bettingAreas, this, () => this.connection);
    }

    private initBettingAreas() {
        this.bettingAreas.forEach((area) => {
            area.init(this.gameData);
        });
    }

    public disabledButtons(status: boolean) {
        super.disabledButtons(status);
        this.doubleAndCallButton.getChildByName("btn-disable").active = status;
    }

    public initButtonStatus() {
        super.initButtonStatus();
        this.doubleAndCallButton.getComponent(NewButton).callback.selected = () =>
            !this.doubleAndCallButton.getChildByName("btn-disable").active && this.onDoubleAndCallClick();
    }

    private registerBettingAreasEvents() {
        this.bettingAreas.forEach((area) => {
            area.node.on(BettingAreaEvents.PLACING_BET, this.onPlacingBet, this);
        });
    }

    private onPlacingBet(betChoice: string) {
        this.placingBet.placeBet(betChoice, this.currentBet);
    }

    private registerPlaceBetEvents() {
        this.gameData.placeBetModel.on(HoldemPokerPlaceBetModel.Events.PLACE_BET, showOwnBet(this.gameData, this.bettingAreas));
        this.gameData.placeBetModel.on(HoldemPokerPlaceBetModel.Events.PLACE_BET, updateTotalBetLabel(this.totalBetLabel));
        this.gameData.placeBetModel.on(HoldemPokerPlaceBetModel.Events.UPDATE_GAME_ROUND, () => {
            this.gameRound.string = "";
        });

        this.gameData.placeBetModel.on(HoldemPokerPlaceBetModel.Events.DOUBLE, showOwnBet(this.gameData, this.bettingAreas));
        this.gameData.placeBetModel.on(HoldemPokerPlaceBetModel.Events.DOUBLE, updateTotalBetLabel(this.totalBetLabel));

        this.gameData.placeBetModel.on(HoldemPokerPlaceBetModel.Events.CALL, showOwnBet(this.gameData, this.bettingAreas));
        this.gameData.placeBetModel.on(HoldemPokerPlaceBetModel.Events.CALL, updateTotalBetLabel(this.totalBetLabel));

        this.gameData.placeBetModel.on(HoldemPokerPlaceBetModel.Events.CLEAR_BETS, updateTotalBetLabel(this.totalBetLabel));

        this.gameData.placeBetModel.on(
            HoldemPokerPlaceBetModel.Events.PLACE_BET_CHIPS,
            showPlaceBetChips(this.bettingAreas, this.betChips, this.shadowChip, this.holdemPokerChips, this.gameData, this)
        );
        this.gameData.placeBetModel.on(HoldemPokerPlaceBetModel.Events.CLEAR_BET_CHIPS, clearBetChips(this.bettingAreas));
        this.gameData.placeBetModel.on(HoldemPokerPlaceBetModel.Events.CLEAR_ALL_BET_CHIPS, clearAllBetChips(this.bettingAreas));
        this.gameData.placeBetModel.on(
            HoldemPokerPlaceBetModel.Events.UPDATE_ALL_CHIPS,
            updateAllChips(this.bettingAreas, this.betChips, this.shadowChip, this.holdemPokerChips)
        );
        this.gameData.placeBetModel.on(
            HoldemPokerPlaceBetModel.Events.UPDATE_CHIPS,
            updateChips(this.bettingAreas, this.betChips, this.shadowChip, this.holdemPokerChips)
        );
    }

    private registerConfigsEvents() {
        this.gameData.configs.on(HoldemPokerConfigs.Events.CHANGE, (configs: HoldemPokerConfigs) => {
            this.setGameConfigs(configs);
            updateMinMax(this.minMaxTable)(this);
            updateAnteOdds(this.anteOddsTable)(configs);
            updateAaOdds(this.aaOddsTable)(configs);
        });
    }

    private registerMD5Event() {
        this.gameData.md5Data.on(MD5ModelBase.Events.CHANGE, (md5: MD5ModelBase) => {
            updateMD5(this.md5Component)(md5);
        });
    }

    private registerStateEvents() {
        this.gameData.stateModel.on(HoldemPokerStateModel.Events.CHANGE, showHideButtons(this));
        this.gameData.stateModel.on(HoldemPokerStateModel.Events.CHANGE, showHideTooltip(this.bettingAreas));
        this.gameData.stateModel.on(HoldemPokerStateModel.Events.CHANGE, showHideClearIcon(this.bettingAreas));
        this.gameData.stateModel.on(HoldemPokerStateModel.Events.PREPARE_NEW_ROUND, () => {
            prepareNewRound(this.gameData.placeBetModel)();
            this.handleDisableSwap(false);
        });
        this.gameData.stateModel.on(HoldemPokerStateModel.Events.CHANGE, handleMD5(this));
    }

    private registerAfterCallEvents() {
        this.gameData.callModel.on(HoldemPokerAfterCallModel.Events.CHANGE, () => {
            this.gameData.settlement.waiting = true;
        });
    }

    private registerAfterDealEvents() {
        this.gameData.dealModel.on(HoldemPokerAfterDealModel.Events.CHANGE, (dealModel) => {
            this.isSwapCard
                ? dealPlayerAndDealerCards(this.pokerCardScript, dealModel, () => this.gameData.stateModel.afterDeal())
                : this.afterDealWithoutSwap();
        });
    }

    private afterDealWithoutSwap() {
        this.gameData.stateModel.afterDeal();
        this.placingBet.hold();
    }

    private registerAfterSwapEvents() {
        this.gameData.swapModel.on(SwapModelBase.Events.CHANGE, (swapModel: SwapModelBase) => {
            swapPlayerAndDealerCards(this.pokerCardScript, swapModel, this.swapCardsNode, () => this.gameData.stateModel.swapSuccess());
        });
    }

    private registerAfterHoldEvents() {
        this.gameData.holdModel.on(HoldemPokerHoldModel.Events.CHANGE, (holdModel: HoldemPokerHoldModel) => {
            this.isSwapCard
                ? holdPlayerAndDealerCards(this.pokerCardScript, holdModel, () => this.gameData.stateModel.holdSuccess())
                : dealPlayerAndDealerCardsWithoutSwap(this.pokerCardScript, holdModel, () => this.gameData.stateModel.holdSuccess());
        });
    }

    private registerBetEvents() {
        this.gameData.on(HoldemPokerGameData.Events.CHOICES_RESULT, updatePreviousChoices(this.gameData.placeBetModel));
        this.gameData.on(HoldemPokerGameData.Events.CHANGE_STATE, () => this.gameData.stateModel.afterDeal());
        this.gameData.on(HoldemPokerGameData.Events.SHOW_PROCESSING_BET, () => this.showProcessingWarning(true));
        this.gameData.on(HoldemPokerGameData.Events.HIDE_PROCESSING_BET, () => this.showProcessingWarning(false));
        this.gameData.ownBets.on(HoldemPokerOwnBet.Events.OWN_BETS, showRejoinOwnBets(this.gameData));
        this.gameData.ownBets.on(HoldemPokerOwnBet.Events.OWN_BETS, showRejoinTotalBet(this.totalBetLabel));
        this.gameData.ownBets.on(HoldemPokerOwnBet.Events.OWN_BETS, (ownBets: HoldemPokerOwnBet) => {
            rawCardWhenRejoin(this.pokerCardScript, ownBets);
            this.handleDisableSwap(true);
        });
    }

    private registerRoundCounterEvents() {
        this.gameData.roundCounter.on(HoldemPokerRoundCounter.Events.CHANGE, updateRoundId(this.gameRound));
    }

    private registerSettlementEvents() {
        this.gameData.on(HoldemPokerGameData.Events.SETTLED, () => {
            this.gameData.stateModel.settle();
        });
        this.gameData.finishModel.on(HoldemPokerFinishModel.Events.CHANGE_SETTLEMENT, () => {
            this.gameData?.settlement.startSettlement();
        });

        this.gameData?.settlement.on(
            HoldemPokerSettlement.Events.START_SETTLEMENT,
            showWinningOption(this.bettingAreas, this.holdemPokerChips, this.betChips, this.gameData, this)
        );

        this.gameData?.settlement.on(HoldemPokerSettlement.Events.START_SHOW_CARDS, () => {
            rawCardAfterClickCall(
                this.pokerCardScript,
                this.gameData.callModel,
                () => {
                    this.md5Component.createResultDetails(this.gameData.md5Data.md5);
                },
                () => {
                    this.gameData.settlement.finishShowCards();
                }
            );
        });
        this.gameData.finishModel.on(HoldemPokerFinishModel.Events.SHOWED_ANIMATION, () => {
            this.gameData.stateModel.afterCall();
        });
    }

    private registerNoticeEvents() {
        this.gameData.on(CommonEvents.API_ERROR, updateStatusGame(this.gameData));
        this.gameData.on(CommonEvents.NOTICE, showSlidingChipWithProcessingFail(this.gameData.stateModel, this.betChips.node));
        this.gameData.on(CommonEvents.UM, handleUM(this));
    }

    private registerTicketDetailEvents() {
        this.gameData.ticketDetailModel.on(HoldemPokerTicketDetailModel.Events.CHANGE, (data) => {
            renderTicketDetail(this.newHistoryComp)(data);
        });
    }

    onDealClick() {
        super.onDealClick();
        this.placingBet.dealBet();
    }

    onDoubleClick() {
        super.onDoubleClick();
        this.placingBet.doubleBet(HoldemPokerChoicesConst.ante, this.gameData.placeBetModel.choices[HoldemPokerChoicesConst.ante]);
    }

    onCancelClick() {
        super.onCancelClick();
        this.gameData.receiveUIData({
            cancel: {}
        });
    }

    onRebetAndDeal() {
        super.onRebetAndDeal();
        collectCards(this.pokerCardScript, () => this.placingBet && this.placingBet.rebetAndDeal());
        clearAllBetChips(this.bettingAreas)();
        this.holdemPokerChips.stopWinningEffect();
    }

    onDoubleAndCallClick() {
        this.playClick();
        this.placingBet.doubleAndCallBet(
            HoldemPokerChoicesConst.call,
            this.gameData.placeBetModel.choices[HoldemPokerChoicesConst.ante] * 2
        );
    }

    onFoldClick() {
        super.onFoldClick();
        this.gameData.receiveUIData({
            fold: {}
        });
        this.lockBet();
        this.connection.emit(events.bet, {
            fold: {},
            clientSentTime: new Date()
        });
        this.gameData.isProcessingBet = true;
    }

    onNewButtonClick() {
        super.onNewButtonClick();
        collectCards(
            this.pokerCardScript,
            () =>
                this.gameData &&
                this.gameData.receiveUIData({
                    new: {}
                })
        );
        clearAllBetChips(this.bettingAreas)();
        this.holdemPokerChips.stopWinningEffect();
    }

    onSwapClick() {
        super.onSwapClick();
        this.placingBet.swap();
    }

    onHoldClick() {
        super.onHoldClick();
        this.placingBet.hold();
    }

    playSingleChipsSound() {
        AudioManager.getInstance().playSFX(this.singleChipAudio.clip);
    }
}
