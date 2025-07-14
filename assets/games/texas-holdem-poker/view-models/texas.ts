import NewButton from "../../../common/custom-button/NewButton";
import TutorialMain from "../../../common/tutorial/TutorialMain";
import { StorageManager } from "../../../managers/StorageManager";
import CasinoGame from "../../_casino/CasinoGame";
import CallModelBase from "../../_casino/event-models/CallModelBase";
import DealModelBase from "../../_casino/event-models/DealModelBase";
import HoldModelBase from "../../_casino/event-models/HoldModelBase";
import { MD5ModelBase } from "../../_casino/event-models/MD5ModelBase";
import SwapModelBase from "../../_casino/event-models/SwapModelBase";
import { CommonEvents } from "../../_new/_base/game-data-management/models/common-events";
import { BettingAreaEvents } from "../../_new/common/betting-area/BettingArea";
import { updateMD5 } from "../../holdem-poker/actions/HoldemPokerMD5Action";
import { updateChips } from "../../holdem-poker/actions/HoldemPokerPlaceBetActions";
import { handleUM } from "../../holdem-poker/actions/HoldemPokerUmAction";
import { collectCards } from "../../holdem-poker/components/cards/view-models/CardWrapper";
import TexasMicroUIAction from "../actions/texas-microUI-action";
import { updateStatusGame } from "../actions/texas-notice-actions";
import {
    clearAllBetChips,
    clearBetChips,
    showHideButtons,
    showHideTooltip,
    showPlaceBetChips,
    updateAllChips
} from "../actions/texas-place-bet-actions";
import { updatePreviousChoices } from "../actions/texas-rejoin-room-actions";
import { showWinningOption } from "../actions/texas-settlement-actions";
import {
    dealFirstThreeCommunityCards,
    dealFourAndFireCardAndFaceUpDealerCards,
    dealPlayerAndDealerCards,
    dealSecondCard,
    dealThirdCardAndFaceUpDealerCards,
    rawCardWhenRejoin,
    swapPlayerAndDealerCards
} from "../cards-component/view-models/cards-wrapper";
import TexasCards from "../cards-component/view-models/texas-cards";
import TexasConfigsModel from "../event-models/texas-configs-model";
import TexasFinishModel from "../event-models/texas-finish-model";
import TexasGameDataModel from "../event-models/texas-game-data-model";
import TexasOwnBetModel from "../event-models/texas-own-bet-model";
import TexasPlaceBetModel from "../event-models/texas-place-bet-model";
import TexasSettlementModel from "../event-models/texas-settlement-model";
import TexasTicketDetailModel from "../event-models/texas-ticket-detail-model";
import TexasTurnModel from "../event-models/texas-turn-model";
import { BetAction, disableButtonText, TexasChoicesConst, TimerShowInteractiveGuide } from "../texas-constants";
import { TexasChoicesType } from "../texas-type";
import { updateLeftRightOddsTable, updateMinMax } from "./../actions/texas-configs-actions";
import { handleMD5 } from "./../actions/texas-md5-action";
import { prepareNewRound, showOwnBet } from "./../actions/texas-place-bet-actions";
import { showRejoinOwnBets } from "./../actions/texas-rejoin-room-actions";
import { renderTicketDetail } from "./../actions/texas-ticket-detail-actions";
import { dealPlayerAndDealerCardsWithoutSwap, holdPlayerAndDealerCards } from "./../cards-component/view-models/cards-wrapper";
import TexasRiverModel from "./../event-models/texas-river-model";
import TexasStateModel from "./../event-models/texas-state-model";
import TexasBettingArea from "./texas-betting-area";
import TexasChips from "./texas-chips";
import TexasMinMax from "./texas-min-max";
import TexasOddsTable from "./texas-odds-table";
import TexasPlacingBet from "./texas-placing-bet";

const { ccclass, property } = cc._decorator;

export const TexasId = 42;

@ccclass
export default class Texas extends CasinoGame {
    @property({ type: [cc.Component] })
    protected bettingAreas: TexasBettingArea[] = [];

    @property({ type: [TexasMicroUIAction] })
    protected microUIAction: TexasMicroUIAction[] = [];

    @property(cc.Node)
    callButton: cc.Node = null;

    @property(cc.Node)
    riverButton: cc.Node = null;

    @property(cc.Node)
    checkRiverButton: cc.Node = null;

    @property(cc.Node)
    turnButton: cc.Node = null;

    @property(cc.Node)
    checkTurnButton: cc.Node = null;

    @property({ type: TexasMinMax })
    protected minMaxTable: TexasMinMax = null;

    @property({ type: [TexasOddsTable] })
    protected oddsTables: TexasOddsTable[] = [];

    @property(cc.Prefab)
    interactiveGuidePrefab: cc.Prefab = null;

    @property(cc.Label)
    totalBetValue: cc.Label = null;

    @property(cc.Node)
    interactiveGuide: cc.Node = null;

    protected placingBet: TexasPlacingBet = null;
    protected gameData: TexasGameDataModel<TexasChoicesType> = null;
    protected texasChips: TexasChips;
    protected pokerCardScript: TexasCards = undefined;

    constructor() {
        super();
        this.gameId = TexasId;
    }

    onLoad() {
        this.gameData = new TexasGameDataModel<TexasChoicesType>();
        this.texasChips = new TexasChips();
        this.microUIAction.forEach((e) => e.connectGameData(this.gameData));
        super.onLoad();
        this.initGeneralEvents();
    }

    initGeneralEvents() {
        this.initPlacingBet();
        this.initButtonStatus();
        this.registerStateEvents();
        this.registerConfigsEvents();
        this.initPokerCardScript();
        this.registerBettingAreasEvents();
        this.registerPlaceBetEvents();
        this.registerAfterDealEvents();
        this.registerAfterSwapEvents();
        this.registerAfterHoldEvents();
        this.registerAfterCallEvents();
        this.registerAfterTurnEvents();
        this.registerAfterRiverEvents();
        this.registerBetEvents();
        this.registerSettlementEvents();
        this.registerTicketDetailEvents();
        this.registerNoticeEvents();
        this.registerMD5Event();
    }

    initInteractiveGuide() {
        const storageKey = "texas_interactive_guide";
        const data = StorageManager.get(storageKey) ?? {
            enabled: true
        };

        if (!data.enabled || !this.interactiveGuidePrefab) {
            return;
        }
        this.handleStatusNodeMain(false);
        const node = cc.instantiate(this.interactiveGuidePrefab);
        this.interactiveGuide.addChild(node);
        const tutorialMain = node.getComponent(TutorialMain);
        tutorialMain.setTimeConfig(TimerShowInteractiveGuide);
        tutorialMain.toggleCallback = (dontShow: boolean) => {
            data.enabled = !dontShow;
            StorageManager.set(storageKey, data);
        };

        tutorialMain.endSlideCallBack = () => {
            this.handleStatusNodeMain(true);
        };
        tutorialMain.show();
    }

    initPokerCardScript() {
        this.pokerCardScript = this.node.getChildByName("poker-cards-script").getComponent(TexasCards);
    }

    handleStatusNodeMain(status: boolean) {
        if (status) {
            this.totalBetValue.string = "0";
        } else {
            this.totalBetValue.string = "";
        }

        this.bettingAreas[0].showTooltip(status);
        this.bettingAreas[0].showBetText(status);
    }

    checkShowUmMessage(data: any) {
        return true;
    }

    private registerConfigsEvents() {
        this.gameData.configs.on(TexasConfigsModel.Events.CHANGE, (configs: TexasConfigsModel) => {
            this.setGameConfigs(configs);
            updateMinMax(this.minMaxTable)(this);
            updateLeftRightOddsTable(this.oddsTables[0])(configs);
            updateLeftRightOddsTable(this.oddsTables[1])(configs);
        });
    }

    public disabledButtons(status: boolean) {
        super.disabledButtons(status);
        const disableButton = "btn-disable";
        this.callButton.getChildByName(disableButton).active = status;
        this.turnButton.getChildByName(disableButton).active = status;
        this.checkTurnButton.getChildByName(disableButton).active = status;
        this.riverButton.getChildByName(disableButton).active = status;
        this.checkRiverButton.getChildByName(disableButton).active = status;
    }

    public initButtonStatus() {
        super.initButtonStatus();
        const disableButton = "btn-disable";
        this.callButton.getComponent(NewButton).callback.selected = () =>
            !this.callButton.getChildByName(disableButton).active && this.onDoubleAndCallClick();

        this.turnButton.getComponent(NewButton).callback.selected = () =>
            !this.turnButton.getChildByName(disableButton).active && this.onTurnClick();

        this.checkTurnButton.getComponent(NewButton).callback.selected = () =>
            !this.checkTurnButton.getChildByName(disableButton).active && this.onCheckTurnClick();

        this.riverButton.getComponent(NewButton).callback.selected = () =>
            !this.riverButton.getChildByName(disableButton).active && this.onRiverClick();

        this.checkRiverButton.getComponent(NewButton).callback.selected = () =>
            !this.checkRiverButton.getChildByName(disableButton).active && this.onCheckRiverClick();
    }

    private initPlacingBet() {
        this.placingBet = new TexasPlacingBet(this.gameData, this, () => this.connection);
    }

    private registerBettingAreasEvents() {
        this.bettingAreas.forEach((area) => {
            area.node.on(BettingAreaEvents.PLACING_BET, this.onPlacingBet, this);
        });
    }

    private onPlacingBet(betChoice: string) {
        if (betChoice === TexasChoicesConst.anteBet) {
            this.dealButton.getChildByName(disableButtonText).active = false;
            this.doubleButton.getChildByName(disableButtonText).active = false;
            this.cancelButton.getChildByName(disableButtonText).active = false;
        }
        this.placingBet.placeBet(betChoice, this.currentBet);
    }

    private registerPlaceBetEvents() {
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.PLACE_BET_CHIPS, ({ currentChoice, currentAmount, totalAmount }) => {
            showPlaceBetChips(
                this.bettingAreas,
                this.betChips,
                this.shadowChip,
                this.texasChips,
                currentChoice,
                currentAmount,
                totalAmount
            );
        });

        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.CLEAR_BET_CHIPS, clearBetChips(this.bettingAreas));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.CLEAR_ALL_BET_CHIPS, clearAllBetChips(this.bettingAreas));
        this.gameData.placeBetModel.on(
            TexasPlaceBetModel.Events.UPDATE_ALL_CHIPS,
            updateAllChips(this.bettingAreas, this.betChips, this.shadowChip, this.texasChips)
        );
        this.gameData.placeBetModel.on(
            TexasPlaceBetModel.Events.UPDATE_CHIPS,
            updateChips(this.bettingAreas, this.betChips, this.shadowChip, this.texasChips)
        );

        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.PLACE_BET, showOwnBet(this.gameData, this.bettingAreas));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.DOUBLE, showOwnBet(this.gameData, this.bettingAreas));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.CALL, showOwnBet(this.gameData, this.bettingAreas));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.TURN, showOwnBet(this.gameData, this.bettingAreas));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.RIVER, showOwnBet(this.gameData, this.bettingAreas));
        this.gameData.placeBetModel.on(TexasPlaceBetModel.Events.UPDATE_GAME_ROUND, () => {
            this.gameRound.string = "";
        });
    }

    private registerSettlementEvents() {
        this.gameData.on(TexasGameDataModel.Events.SETTLED, () => {
            this.gameData.stateModel.settle();
        });

        this.gameData.finishModel.on(TexasFinishModel.Events.CHANGE_SETTLEMENT, () => {
            this.gameData?.settlement.startSettlement();
        });

        this.gameData?.settlement.on(
            TexasSettlementModel.Events.START_SETTLEMENT,
            showWinningOption(this.bettingAreas, this.texasChips, this.betChips, this.gameData, this)
        );

        this.gameData?.settlement.on(TexasSettlementModel.Events.START_SHOW_CARDS, () => {
            dealThirdCardAndFaceUpDealerCards(
                this.pokerCardScript,
                this.gameData.riverModel,
                () => {
                    this.gameData?.settlement.finishShowCards();
                },
                () => {
                    this.md5Component.createResultDetails(this.gameData.md5Data.md5);
                }
            );
        });

        this.gameData?.settlement.on(TexasSettlementModel.Events.START_AUTO_CHECK, () => {
            this.turnButton.active = this.checkTurnButton.active = this.riverButton.active = this.checkRiverButton.active = false;
            this.reBetAndDealButton.active = this.newButton.active = false;
            this.holdButton.active = this.swapButton.active = false;
            dealFourAndFireCardAndFaceUpDealerCards(this.pokerCardScript, this.gameData.autoSettleModel, () => {
                this.gameData?.settlement.finishShowCards();
            });
        });

        this.gameData?.finishModel.on(TexasFinishModel.Events.SHOWED_ANIMATION, () => {
            this.gameData?.stateModel.riveSuccess();
            this.gameData.settlement.autoSettle = false;
        });
    }

    private registerStateEvents() {
        this.gameData.stateModel.on(TexasStateModel.Events.CHANGE, showHideButtons(this));
        this.gameData.stateModel.on(TexasStateModel.Events.CHANGE, showHideTooltip(this.bettingAreas));
        this.gameData.stateModel.on(TexasStateModel.Events.PREPARE_NEW_ROUND, () => {
            prepareNewRound(this.gameData.placeBetModel)();
            this.handleDisableSwap(false);
        });
        this.gameData.stateModel.on(TexasStateModel.Events.FORCE_UPDATE_BALANCE, () => this.updateUserBalance());
        this.gameData.stateModel.on(TexasStateModel.Events.CHANGE, handleMD5(this));
    }

    private registerAfterDealEvents() {
        this.gameData.dealModel.on(DealModelBase.Events.CHANGE, () => {
            this.isSwapCard
                ? dealPlayerAndDealerCards(this.pokerCardScript, () => this.gameData.stateModel.afterDeal())
                : this.afterDealWithoutSwap();
        });
    }

    private afterDealWithoutSwap() {
        this.gameData.stateModel.afterDeal();
        this.placingBet.handleClickOnChoice(TexasChoicesConst.hold);
    }

    private registerAfterSwapEvents() {
        this.gameData.swapModel.on(SwapModelBase.Events.CHANGE, (swapModel: SwapModelBase) => {
            swapPlayerAndDealerCards(this.pokerCardScript, swapModel, this.swapCardsNode, () => this.gameData.stateModel.swapSuccess());
        });
    }

    private registerAfterHoldEvents() {
        this.gameData.holdModel.on(HoldModelBase.Events.CHANGE, (holdModel: HoldModelBase) => {
            this.isSwapCard
                ? holdPlayerAndDealerCards(this.pokerCardScript, holdModel, () => this.gameData.stateModel.holdSuccess())
                : dealPlayerAndDealerCardsWithoutSwap(this.pokerCardScript, holdModel, () => this.gameData.stateModel.holdSuccess());
        });
    }

    private registerAfterCallEvents() {
        this.gameData.callModel.on(CallModelBase.Events.CHANGE, (callModel: CallModelBase) => {
            dealFirstThreeCommunityCards(this.pokerCardScript, callModel, () => this.gameData.stateModel.callSuccess());
        });
    }
    private registerAfterTurnEvents() {
        this.gameData.turnModel.on(TexasTurnModel.Events.CHANGE, (turnModel: TexasTurnModel) => {
            dealSecondCard(this.pokerCardScript, turnModel, () => this.gameData.stateModel.turnSuccess());
        });
    }

    private registerAfterRiverEvents() {
        this.gameData.riverModel.on(TexasRiverModel.Events.CHANGE, () => {
            this.gameData.settlement.waiting = true;
        });
    }

    private registerBetEvents() {
        this.gameData.on(TexasGameDataModel.Events.CHOICES_RESULT, updatePreviousChoices(this.gameData.placeBetModel));
        this.gameData.on(TexasGameDataModel.Events.SHOW_PROCESSING_BET, () => this.showProcessingWarning(true));
        this.gameData.on(TexasGameDataModel.Events.HIDE_PROCESSING_BET, () => this.showProcessingWarning(false));

        this.gameData.ownBets.on(TexasOwnBetModel.Events.EMPTY, () => {
            this.initInteractiveGuide();
        });
        this.gameData.ownBets.on(TexasOwnBetModel.Events.OWN_BETS, showRejoinOwnBets(this.gameData));
        this.gameData.ownBets.on(TexasOwnBetModel.Events.OWN_BETS, (ownBets: TexasOwnBetModel) => {
            rawCardWhenRejoin(this.pokerCardScript, ownBets);
            this.handleDisableSwap(true);
        });
    }

    private registerTicketDetailEvents() {
        this.gameData.ticketDetailModel.on(TexasTicketDetailModel.Events.CHANGE, (data) => {
            renderTicketDetail(this.newHistoryComp)(data);
        });
    }

    private registerNoticeEvents() {
        this.gameData.on(CommonEvents.API_ERROR, updateStatusGame(this.gameData));
        this.gameData.on(CommonEvents.NOTICE, () => this.disabledButtons(false));
        this.gameData.on(CommonEvents.UM, handleUM(this));
    }

    private registerMD5Event() {
        this.gameData.md5Data.on(MD5ModelBase.Events.CHANGE, (md5: MD5ModelBase) => {
            updateMD5(this.md5Component)(md5);
        });
    }

    onDealClick() {
        super.onDealClick();
        this.placingBet.handleClickDeal();
    }

    onDoubleClick() {
        super.onDoubleClick();
        this.placingBet.doubleBet(TexasChoicesConst.anteBet, this.gameData.placeBetModel.choices[TexasChoicesConst.anteBet]);
    }

    onCancelClick() {
        super.onCancelClick();
        this.placingBet.clear();
    }

    onDoubleAndCallClick() {
        this.playClick();
        this.placingBet.handleClickButton(
            TexasChoicesConst.callBet,
            this.gameData.placeBetModel.choices[TexasChoicesConst.anteBet] * 2,
            BetAction.doubleCall
        );
    }

    onTurnClick() {
        this.playClick();
        this.placingBet.handleClickButton(
            TexasChoicesConst.turnBet,
            this.gameData.placeBetModel.choices[TexasChoicesConst.anteBet],
            BetAction.betTurn
        );
    }

    onCheckTurnClick() {
        this.playClick();
        this.placingBet.handleClickButtonNoneBet(TexasChoicesConst.checkTurn);
    }

    onRiverClick() {
        this.playClick();
        this.placingBet.handleClickButton(
            TexasChoicesConst.riverBet,
            this.gameData.placeBetModel.choices[TexasChoicesConst.anteBet],
            BetAction.betRiver
        );
    }

    onCheckRiverClick() {
        this.playClick();
        this.placingBet.handleClickButtonNoneBet(TexasChoicesConst.checkRiver);
    }

    onRebetAndDeal() {
        super.onRebetAndDeal();
        collectCards(this.pokerCardScript, () => this.placingBet && this.placingBet.rebetAndDeal());
        clearAllBetChips(this.bettingAreas)();
        this.texasChips.stopWinningEffect();
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
        this.texasChips.stopWinningEffect();
    }

    onFoldClick() {
        super.onFoldClick();
        this.placingBet.handleClickButtonNoneBet(TexasChoicesConst.fold);
    }

    onSwapClick() {
        super.onSwapClick();
        this.placingBet.handleClickOnChoice(TexasChoicesConst.swap);
    }

    onHoldClick() {
        super.onHoldClick();
        this.placingBet.handleClickOnChoice(TexasChoicesConst.hold);
    }
}
