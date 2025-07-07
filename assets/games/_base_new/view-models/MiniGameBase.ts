import CountDownProgressBar from "../../../common/count-down-progress-bar/view-models/CountDownProgressBar";
import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import ExtraFeature from "../../../common/extra-features/ExtraFeature";
import GameIdSprite from "../../../common/GameIdSprite";
import MiniRoundHistory from "../../../common/mini-round-history/MiniRoundHistory";
import { appManager } from "../../../managers/AppManager";
import { onReceiveLoginPlayerStatus, onReceiveOthersStatus } from "../../_base/action/PayChipsAction";
import { GameState } from "../../_base/GameState";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import { GameData } from "../../_new/_base/game-data-management/models/game-data";
import { TotalBets } from "../../_new/_base/game-data-management/models/total-bets";
import NewMiniGameBase from "../../_new/_base/NewMiniGameBase";
import {
    changeBetPercentage,
    handleFlyOwnChipFake,
    handlePayChips,
    placeBetFailed,
    placeBetSuccess,
    placeOwnChipsFake,
    updateOwnBets,
    updatePreviousBets,
    updateTotalBets
} from "../actions/BetAction";
import {
    changeGameRound,
    checkToOffUM,
    handleAfterSettlementResult,
    handleBoostedChoices,
    handleBoostedOdds,
    handleFirstLoadRoundHistory,
    handleGameConfigs,
    handleNotice,
    handleRoundHistory,
    handleShowResult,
    handleShowStatus,
    handleWinningStreak,
    onUM,
    showBetDetailsUrl,
    showHashAtPlacingBet,
    updateMD5String
} from "../actions/CommonAction";
import {
    clearRoundData,
    handleForceTimeOut,
    showLastRoundId,
    startGameLoop,
    stopGameLoop,
    updateLockBet,
    updatePlacingBet,
    updateStartingRound,
    updateTimeOut,
    updateWaiting
} from "../actions/TimeAction";
import { BetDetailsUrl } from "../models/BetDetailsUrl";
import { BetModel } from "../models/BetModel";
import { BoostedChoicesModel } from "../models/BoostedChoicesModel";
import { BoostedOddsModel } from "../models/BoostedOddsModel";
import { GameConfigs } from "../models/GameConfigs";
import GameDataManager from "../models/GameDataManager";
import NewGameData from "../models/NewGameData";
import { NoticeModel } from "../models/NoticeModel";
import { ResultHash } from "../models/ResultHash";
import { RoundHistory } from "../models/RoundHistory";
import { Settlement } from "../models/Settlement";
import { UMModel } from "../models/UMModel";

const { ccclass, property } = cc._decorator;

interface EmitterStorage {
    emitter: EventEmitterBase;
    eventName: string;
    listener: (param?: any) => void;
}

@ccclass
export default class MiniGameBase extends NewMiniGameBase {
    @property({ type: cc.Label })
    betPercentage: cc.Label[] = [];

    @property(cc.Node)
    waitingDotsSubGame: cc.Node = null;

    @property(GameIdSprite)
    gameNameSprite: GameIdSprite = null;

    @property(cc.Node)
    tableGameBg: cc.Node = null;

    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    @property(cc.JsonAsset)
    gameAudioConfig: cc.JsonAsset = null;

    protected managedByContainer = false;

    isShowingSettlementOnUI = false;
    miniRoundHistory: MiniRoundHistory;
    public gameData: NewGameData;
    public countDownProgressBar: CountDownProgressBar;
    emitterStorages: EmitterStorage[] = [];
    internalTweenNodes: cc.Node[] = [];
    readonly internalTweenTag = 99;
    public isCollectChip = true;
    startRoundDuration = 1;
    showResultDuration = 2;
    wholeResultTime = 3;
    isPlacingFakeChip = true;
    streakChoices = [];
    callbackWinningResult = (game: any, status: any) => {};
    callbackWinningStreak = (game: any) => {};
    extraFeature: ExtraFeature;

    override onLoad() {
        super.onLoad();
        this.initGameData();
        this.initGameDataEvents();
        this.extraFeature = this.node.getComponent(ExtraFeature);
    }

    override start() {
        this.initOnStart();
    }

    override onEnable() {
        this.grantSocket();
        this.initSocketListener();
        this.startGame();

        if (!this.managedByContainer) {
            this.clearAllData();
            this.registerViewGame();
        }
    }

    override onDestroy() {
        this.stopInternalTweens();
        this.removeGameDataEvents();
        if (!this.managedByContainer) {
            GameDataManager.getInstance().clearGameLoop(this.gameId);
            this.clearGameData();
        }
        super.onDestroy();
    }

    cleanGame() {
        GameDataManager.getInstance().clearGameLoop(this.gameId);
        this.socketIOController.closeSocket(this.gameId);
        this.showProcessingWarning(false);
        this.md5Component && this.md5Component.resetMd5();
    }

    override closeGame() {
        this.playClick();
        this.cleanGame();
        this.stopAllSFX();
        this.node.active = false;
        this.currentMiniPanel.onGamesLayerChanged();
    }

    override onData(data: unknown) {
        if (this.gameState === GameState.Inactived) {
            return;
        }
        super.onData(data);
    }

    initOnStart() {
        this.initDynamicAudios();
    }

    initDynamicAudios() {
        if (this?.gameAudios && this?.gameAudioConfig) {
            this.gameAudios?.initConfigsAudios(this?.gameAudioConfig);
        }
    }

    onGameHide() {
        super.onGameHide();
        this.stopInternalTweens();
        this.gameState = GameState.Inactived;
        this.gameData.durations.stop();
    }

    onGameShow() {
        this.stopInternalTweens();
        this.gameState = GameState.Actived;
        this.clearAllData();
        this.joinGame();
    }

    clearRoundHistory() {
        this.gameData.roundHistory.clearData();
    }

    clearAllData() {
        super.clearAllData();
        this.clearData();
    }

    onDisconnected() {
        //override to prevent delete socket
        this.showProcessingWarning(false);
        this.md5Component && this.md5Component.resetMd5();
        this.onDisconnectCallback && this.onDisconnectCallback();
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.isShowingSettlementOnUI = false;
        this.betPercentage && this.betPercentage.forEach((label) => (label.string = `0%`));
    }

    disableGame() {
        super.disableGame();
        this.gameData.durations.stop();
    }

    override initHandlers() {
        this.umHandler = null;
        this.noticeHandler = null;
        this.statusHandler = null;
        this.betHandler = null;
        this.timeHandler = null;
        this.errorHandler = null;
        this.logsHandler = null;
        this.finishHandler = null;
        this.configsHandler = null;
        this.md5Handler = null;
    }

    createGameData(): GameData {
        return new NewGameData();
    }

    initGameData() {
        const dataManager = GameDataManager.getInstance();
        let gameData = dataManager.getGameData(this.gameId);
        if (!gameData) {
            gameData = this.createGameData();
            dataManager.setGameData(this.gameId, gameData);
        }

        this.gameData = gameData;
        this.gameData.roundHistory.setStreakChoices(this.streakChoices);
        this.gameData.betModel.getChipValues = () => this.betChips.chipValues;
        this.initGameDataDurations();
    }

    initGameDataDurations() {
        this.gameData.durations.initialize({
            wholeRound: this.config.fullTime,
            placingBet: this.config.betTime,
            lockingBet: this.config.stopBetTime
        });

        this.gameData.durations.addEvent(
            Durations.Events.SHOW_ANIMATION,
            {
                startTimePoint: this.config.fullTime,
                endTimePoint: this.config.fullTime - this.showResultDuration + 1
            },
            null,
            Durations.Events.WAITING
        );

        this.gameData.durations.addEvent(
            Durations.Events.STARTING_ROUND,
            {
                startTimePoint: this.config.betTime + this.startRoundDuration,
                endTimePoint: this.config.betTime
            },
            Durations.Events.WAITING,
            Durations.Events.PLACING_BET
        );
    }

    emitterListener(emitter: EventEmitterBase, eventName: string, listener: (param: any) => any) {
        if (!emitter) {
            cc.log("emitter null for ", eventName);
            return;
        }
        const storage = {
            emitter,
            eventName,
            listener: listener(this)
        };
        emitter.addListener(eventName, storage.listener);
        this.emitterStorages.push(storage);
    }

    get startRoundEvent() {
        return this.startRoundDuration > 0 ? Durations.Events.BEGIN_STARTING_ROUND : Durations.Events.BEGIN_PLACING_BET;
    }

    initGameDataEvents() {
        this.emitterListener(this.gameData.umModel, UMModel.Events.ON_UM, onUM);
        this.emitterListener(this.gameData.umModel, UMModel.Events.CHECK_OFF_UM, checkToOffUM);

        this.emitterListener(this.gameData.durations, this.startRoundEvent, clearRoundData);
        this.emitterListener(this.gameData.durations, Durations.Events.START_GAME_LOOP, startGameLoop);
        this.emitterListener(this.gameData.durations, Durations.Events.STOP_GAME_LOOP, stopGameLoop);
        this.emitterListener(this.gameData.durations, Durations.Events.TIMEOUT, updateTimeOut);
        this.emitterListener(this.gameData.durations, Durations.Events.LOCKING_BET, updateLockBet);
        this.emitterListener(this.gameData.durations, Durations.Events.PLACING_BET, updatePlacingBet);
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_PLACING_BET, showHashAtPlacingBet);
        this.emitterListener(this.gameData.durations, Durations.Events.WAITING, updateWaiting);
        if (this.startRoundDuration > 0) {
            this.emitterListener(this.gameData.durations, Durations.Events.STARTING_ROUND, updateStartingRound);
        }
        this.emitterListener(this.gameData.durations, Durations.Events.WAITING, showLastRoundId);

        this.emitterListener(this.gameData.totalBets, TotalBets.Events.CHANGE, updateTotalBets);
        this.emitterListener(this.gameData.betModel, BetModel.Events.CHANGE_OWN_BET, updateOwnBets);
        this.emitterListener(this.gameData.betModel, BetModel.Events.UPDATE_PREVIOUS_BET, updatePreviousBets);
        this.emitterListener(this.gameData.betModel, BetModel.Events.PLACE_BET_FAILED, placeBetFailed);
        this.emitterListener(this.gameData.betModel, BetModel.Events.PLACE_BET_SUCCESS, placeBetSuccess);
        this.emitterListener(this.gameData.betModel, BetModel.Events.CHANGE_BET_PERCENTAGE, changeBetPercentage);
        this.emitterListener(this.gameData.betModel, BetModel.Events.FLY_OWN_CHIP_FAKE, handleFlyOwnChipFake);
        this.emitterListener(this.gameData.betModel, BetModel.Events.CHANGE_OWN_CHIPS_FAKE, placeOwnChipsFake);

        this.emitterListener(this.gameData.gameConfigs, GameConfigs.Events.CHANGE, handleGameConfigs);
        this.emitterListener(this.gameData.notice, NoticeModel.Events.CHANGE, handleNotice);
        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.FIRST_LOAD, handleFirstLoadRoundHistory);
        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.CHANGE, handleRoundHistory);
        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.WINNING_STREAK, handleWinningStreak);

        this.emitterListener(this.gameData, NewGameData.Events.CHANGE_ROUND_ID, changeGameRound);
        this.emitterListener(this.gameData.resultHash, ResultHash.Events.CHANGE, updateMD5String);
        this.emitterListener(this.gameData.settlement, Settlement.Events.RECEIVED_LOGIN_PLAYER_STATUS, onReceiveLoginPlayerStatus);
        this.emitterListener(this.gameData.settlement, Settlement.Events.RECEIVED_OTHERS_STATUS, onReceiveOthersStatus);
        this.emitterListener(this.gameData.settlement, Settlement.Events.SHOW_STATUS, handleShowStatus);
        this.emitterListener(this.gameData.settlement, Settlement.Events.SHOW_RESULT, handleShowResult);
        this.emitterListener(this.gameData.settlement, Settlement.Events.END_SHOW_RESULT, handleAfterSettlementResult);
        this.emitterListener(this.gameData.settlement, Settlement.Events.END_SHOW_RESULT, handlePayChips);
        this.emitterListener(this.gameData.settlement, Settlement.Events.FORCE_TIMEOUT, handleForceTimeOut);
        this.emitterListener(this.gameData.boostedOddsModel, BoostedOddsModel.Events.CHANGE, handleBoostedOdds);
        this.emitterListener(this.gameData.boostedChoicesModel, BoostedChoicesModel.Events.CHANGE, handleBoostedChoices);

        this.emitterListener(this.gameData.betDetailsUrl, BetDetailsUrl.Events.CHANGE, showBetDetailsUrl);
    }

    checkShowUmMessage(data: any) {
        return this.gameData.durations.isBeingSpecificPhase(Durations.Events.PLACING_BET);
    }

    /**
     * Show settlement result, must call gameData.settlement.finishShowResult at the end
     */
    showSettlementResult(settlement: any) {
        this.gameData.settlement.finishShowResult(settlement, true);
    }

    /**
     * Handling after showing settlement result
     */
    handleAfterSettlementResult(settlement: any, animated: boolean) {
        this.gameData.roundHistory.update();
        this.gameData.resultHash.updateUI();
    }

    /**
     * Handle round history
     */
    handleRoundHistory(roundHistory: any) {
        this.updateRoundHistory();
    }

    renderTableGame(gameId: number) {
        if (this.gameNameSprite) {
            this.gameNameSprite.prefix = `game-name-${window.i18n.curLang}-`;
            this.gameNameSprite.gameId = gameId;
        }
    }

    showStatus(status: any) {
        if (!appManager.GAME_IS_SHOWED) {
            return;
        }

        const { win, bet } = status;
        if (win) {
            this.showWinningBet(bet);
            this.updateUserBalance();
        }
    }

    initMiniRoundHistory(node: cc.Node) {
        this.miniRoundHistory = node.getComponent(MiniRoundHistory);
        this.miniRoundHistory.managedByParent = true;

        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.CHANGE, () => () => {
            this.miniRoundHistory.nextItemActive = false;
        });
        this.emitterListener(this.gameData.durations, Durations.Events.LOCKING_BET, () => () => {
            this.miniRoundHistory.nextItemActive = true;
        });
    }

    updateRoundHistory() {
        this.miniRoundHistory && this.miniRoundHistory.setData(this.currentDataLogs);
    }

    setWaitingDotsVisibility(show: boolean, animated = true) {
        if (this.waitingDotsSubGame) {
            if (animated) {
                this.waitingDotsSubGame.opacity = show ? 0 : 255;
                this.tween(this.waitingDotsSubGame)
                    .to(0.3, { opacity: show ? 255 : 0 }, { easing: "quintInOut" })
                    .start();
            } else {
                this.waitingDotsSubGame.opacity = show ? 255 : 0;
            }
        }
    }

    initCountDownProgressBar(node: cc.Node) {
        const countDownTimer = node.getComponent(CountDownProgressBar);
        if (countDownTimer) {
            this.countDownProgressBar = countDownTimer;
            countDownTimer.setFullRoundTime(this.config.betTime);
            this.animatedTime.setNumberColor("#0fdb5e", "#ff0000");
        }
    }

    showAcceptedBet(bet: number) {
        if (this.extraFeature) {
            this.extraFeature.showAcceptedBet(bet);
        } else {
            super.showAcceptedBet(bet);
        }
    }

    showWinningBet(bet: number) {
        if (this.extraFeature) {
            this.extraFeature.showWinningBet(bet);
        } else {
            super.showWinningBet(bet);
        }
    }

    clearWinningBet() {
        if (this.extraFeature) {
            this.extraFeature.clearWinningBet();
        } else {
            super.clearWinningBet();
        }
    }

    isShowingResultLastRound() {
        return (
            this.gameData.durations.isWaiting() ||
            this.gameData.durations.isBeingSpecificPhase(Durations.Events.SHOW_ANIMATION) ||
            this.gameData.durations.isBeingSpecificPhase(Durations.Events.STARTING_ROUND)
        );
    }

    isStartingRound() {
        return this.gameData.durations.isBeingSpecificPhase(Durations.Events.STARTING_ROUND);
    }

    initProvablyFair(node: cc.Node): void {
        super.initProvablyFair(node);
        const pfContainer = new cc.Node("PFContainer");
        const pfContainerWidget = pfContainer.addComponent(cc.Widget);
        pfContainerWidget.isAlignTop =
            pfContainerWidget.isAlignBottom =
            pfContainerWidget.isAlignLeft =
            pfContainerWidget.isAlignRight =
                true;
        pfContainerWidget.top = pfContainerWidget.bottom = pfContainerWidget.left = pfContainerWidget.right = 0;
        this.currentMiniPanel.node.addChild(pfContainer);
        pfContainerWidget.updateAlignment();
        this.provablyFairComponent.node.parent.parent = pfContainer;
        pfContainer.setSiblingIndex(4);
    }
}
