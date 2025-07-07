import * as i18n from "i18n/runtime-scripts/LanguageData";
import * as _ from "lodash";
import { Socket } from "socket.io-client";

import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../analytics/AnalyticsManager";
import GameUtils from "../../common/GameUtils";
import AnimatedTime from "../../common/animated-time/view-models/AnimatedTime";
import AudioManager from "../../common/audio/AudioManager";
import { getLanguage, getLocale } from "../../common/auth/SessionManager";
import UserService from "../../common/auth/UserService";
import BetChips from "../../common/bet-chips/view-models/BetChips";
import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import InGameMenu, { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import { NoticeData } from "../../common/notice/view-models/Notice";
import ProcessingWarning from "../../common/processing-warning/view-models/ProcessingWarning";
import PromptMessageComponent from "../../common/prompt-message/PromptMessageComponent";
import TypingLabel from "../../common/typing-label/view-models/TypingLabel";
import UmWarning from "../../common/um-warning/UmWarning";
import UserProfile from "../../common/user-profile/UserProfile";
import { userManager } from "../../common/user/UserManager";
import NoticeUtil from "../../common/utils/NoticeUtil";
import WebViewGuide from "../../common/webview-guide/WebViewGuide";
import { getGameConfiguration } from "../../configs/GameConfigurations";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { roundTimerManager } from "../../mini-games-panel/view-models/RoundTimerManager";
import GameDataManager from "../_base_new/models/GameDataManager";
import TableGameBaseInterface from "../_base_new/view-models/TableGameBaseInterface";
import { GameData } from "../_new/_base/game-data-management/models/game-data";
import { GameState } from "./GameState";
import GameViewBase from "./GameViewBase";
import IGameBase from "./IGameBase";
import { Orientation } from "./Orientation";
import {
    PayChipInfo,
    payChipsToInGamePlayers,
    payChipsToLoginPlayer,
    payChipsToOtherPlayers,
    showPayoutForLoginPlayer
} from "./action/PayChipsAction";
import DataHandler from "./handlers/DataHandler";
import GameBaseBetHandler from "./handlers/GameBaseBetHandler";
import GameBaseConfigsHandler from "./handlers/GameBaseConfigsHandler";
import GameBaseErrorHandler from "./handlers/GameBaseErrorHandler";
import GameBaseFinishHandler from "./handlers/GameBaseFinishHandler";
import GameBaseLogsHandler from "./handlers/GameBaseLogsHandler";
import GameBaseMd5Handler from "./handlers/GameBaseMd5Handler";
import GameBaseNoticeHandler from "./handlers/GameBaseNoticeHandler";
import GameBaseOddsHandler from "./handlers/GameBaseOddsHandler";
import GameBaseProvablyFairHandler from "./handlers/GameBaseProvablyFairHandler";
import { GameBaseStatusHandler } from "./handlers/GameBaseStatusHandler";
import GameBaseTimeHandler from "./handlers/GameBaseTimeHandler";
import GameBaseUmDataHandler from "./handlers/GameBaseUmDataHandler";
import GameBaseVoidTicketHandler from "./handlers/GameBaseVoidTicketHandler";
import GameBaseWinnersHandler from "./handlers/GameBaseWinnersHandler";
import { IGameBaseMd5Handler } from "./handlers/interfaces";
import BetItem from "./view-models/BetItem";
import GameAudios from "./view-models/GameAudios";
import { GameConfigBase } from "./view-models/GameConfigBase";
import MD5Component from "./view-models/MD5Component";
import RebetButton from "./view-models/RebetButton";
import SocketIOGameHistoryBase from "./view-models/SocketIOGameHistoryBase";
import ProvablyFairComponent from "./view-models/provably-fair/ProvablyFairComponent";

const { ccclass, property } = cc._decorator;

interface EmitterStorage {
    emitter: EventEmitterBase;
    eventName: string;
    listener: (param?: any) => void;
}

@ccclass
export default class GameBase extends GameViewBase implements IGameBase {
    @property({ type: BetItem })
    betItems: BetItem[] = [];

    @property(cc.Prefab)
    processWarningPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    promptMessagePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    miniNoticePrefab: cc.Prefab = null;

    @property(cc.Node)
    noticeNode: cc.Node = null;

    @property(cc.Node)
    promptMessageContainer: cc.Node = null;

    @property(UmWarning)
    umNotice: UmWarning = null;

    @property(cc.Node)
    timeWaitNode: cc.Node = null;

    @property(cc.Label)
    timeWaitLabel: cc.Label = null;

    @property({ type: AnimatedTime })
    animatedTime: AnimatedTime = null;

    @property({ type: MD5Component })
    md5Component: MD5Component = null;

    @property({ type: ProvablyFairComponent, visible: false })
    provablyFairComponent: ProvablyFairComponent = null;

    @property(cc.Label)
    gameRound: cc.Label = null;

    @property
    enableChips = false;

    @property({
        type: cc.Node,
        visible: function (this: GameBase) {
            return this.enableChips;
        }
    })
    betChipsContainer: cc.Node = null;

    @property({
        type: cc.Prefab,
        visible: function (this: GameBase) {
            return this.enableChips;
        }
    })
    betChipsPrefab: cc.Prefab = null;

    @property({
        visible: function (this: GameBase) {
            return this.enableChips;
        }
    })
    enablePlaceChips = false;

    @property({
        type: cc.Node,
        visible: function (this: GameBase) {
            return this.enablePlaceChips;
        }
    })
    dealerChipBox: cc.Node = null;

    @property(cc.Prefab)
    gameAudiosPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    guidePrefab: cc.Prefab = null;

    orientation = Orientation.Landscape;
    userProfile: UserProfile;

    protected historyComponent: SocketIOGameHistoryBase;

    public get gameName() {
        const gameConfiguration = getGameConfiguration(this.gameId);

        return gameConfiguration?.key;
    }

    public socket: Socket;
    public gameState = GameState.None;
    public get isStopGame() {
        return this.gameState === GameState.Stopped;
    }
    public get isDisableGame() {
        return this.gameState === GameState.Disabled;
    }
    public waitingProcessing = false;
    public currentTimeRemaining: number;
    public config: GameConfigBase;
    public currentDataLogs = [];
    public roundId = -1;
    public gameConfigs: any;
    public finishShowResult = true;
    public boostedChoices: string[];
    public showOtherPlayerChips = true;

    public umHandler: DataHandler;
    public noticeHandler: DataHandler;
    public statusHandler: GameBaseStatusHandler;
    public betHandler: DataHandler;
    public timeHandler: GameBaseTimeHandler;
    public errorHandler: DataHandler;
    public logsHandler: DataHandler;
    public finishHandler: DataHandler;
    public configsHandler: DataHandler;
    public md5Handler: IGameBaseMd5Handler;
    public provablyFairHandler: DataHandler;
    public oddsHandler: DataHandler;

    public voidTicketHandler: DataHandler;
    public winnersHandler: DataHandler;

    inGameMenu: InGameMenu;
    public betChips: BetChips;
    public currentBet: number;
    public gameAudios: GameAudios;
    private readonly dataHandlers: DataHandler[] = [];
    private processingWarning: cc.Node;
    public needHideNextDotRoundHistory = false;
    hideUmDataKeys = ["remainingTime"];
    previousOwnBets: any;
    rebetButton: RebetButton;
    isReceivedUMData = false;

    public usingNewSettlement = false;
    public inSettlementSequence = false;
    // using multiplay game
    public gameData: GameData;

    public winnersData: any;
    public onDisconnectCallback = () => {
        // handle
    };
    protected managedByContainer = false;
    emitterStorages: EmitterStorage[] = [];
    internalTweenNodes: cc.Node[] = [];
    readonly internalTweenTag = 99;
    truthyRoundId: number;
    closeGameByClick = false;
    syncShowingMD5WithResult = false;
    isDonePayingChip = false;
    promptMessageComponent: PromptMessageComponent = null;

    maximizeCallback = (gameId: number) => {
        //callback
    };

    setConfig(config: GameConfigBase) {
        this.config = config;
    }

    isReadyBet(): boolean {
        return !this.isDisableGame && this.gameConfigs !== undefined;
    }

    getUserBalance(): number {
        return userManager.balance;
    }

    onLoad() {
        super.onLoad();
        this.setUpHandlers();
        this.initBetChips();
        this.initGameAudios();
        this.setGameRound(0);
        this.resetDataAndUI();
        this.animatedTime?.setRedTime(this.config?.stopBetTime);
    }

    onDestroy() {
        super.onDestroy();
        this.md5Component = null;
        this.provablyFairComponent = null;
    }

    setUpHandlers() {
        this.initHandlers();
        this.addHandlers(
            this.umHandler,
            this.timeHandler,
            this.configsHandler,
            this.logsHandler,
            this.betHandler,
            this.noticeHandler,
            this.statusHandler,
            this.errorHandler,
            this.finishHandler,
            this.md5Handler,
            this.provablyFairHandler,
            this.oddsHandler,
            this.voidTicketHandler,
            this.winnersHandler
        );
    }

    joinGame() {
        this.startGame();
        this.registerViewGame();
    }

    clearRoundHistory() {
        this.currentDataLogs = [];
    }

    addRoundHistory(history, maxNumberOfHistory = 100) {
        history?.roundId !== +this.currentDataLogs[0]?.roundId && this.currentDataLogs.unshift(history);
        this.currentDataLogs.length > maxNumberOfHistory && this.currentDataLogs.pop();
    }

    onEnable() {
        this.clearAllData();
        this.joinGame();
    }

    onDisable() {
        this.stopGame();
    }

    onData(data: any) {
        for (let index = 0; index < this.dataHandlers.length; index++) {
            const handler = this.dataHandlers[index];
            handler && handler.handle(data);
            if (index === 0 && this.isShowingUM(data)) {
                break;
            }
        }
    }

    closeGame() {
        uiManager.emitter.emit(InternalEvents.CLOSE_GAME, this.gameId);
        this.playClick();
        this.node.active = false;
        this.md5Component && this.md5Component.resetMd5();
    }

    /** Clear all intervals and timeouts in game */
    stopGame() {
        this.gameState = GameState.Stopped;
        this.clearIntervalAndTimeout();
        this.resetDataAndUI();
        this.md5Component && this.md5Component.resetMd5();
    }

    disableGame() {
        this.gameState = GameState.Disabled;
        this.clearIntervalAndTimeout();
        this.resetDataAndUI();
    }

    startGame() {
        this.gameState = GameState.Started;
    }

    /** Register with game on server */
    public registerViewGame() {
        // handle
    }

    onSignIn() {
        if (!this.node.active) {
            return;
        }

        this.registerViewGame();
    }

    showAcceptedBet(bet: number) {
        GameUtils.addFlyingText(this.noticeNode, false, bet, 1);
    }

    showWinningBet(bet: number) {
        const winningBet = GameUtils.addFlyingText(this.noticeNode, true, bet, 4);
        winningBet.name = "winningBet";
    }

    clearWinningBet() {
        try {
            const winningBet = this.noticeNode.getChildByName("winningBet");
            if (winningBet) {
                winningBet.destroy();
            }
        } catch (e) {
            cc.log(e);
        }
    }

    clearGameRound() {
        this.gameRound && (this.gameRound.string = "");
    }

    setGameRound(gameRoundId) {
        this.truthyRoundId = gameRoundId;
        if (!this.gameRound || gameRoundId < 0) {
            return;
        }

        const gameRound = this.formatGameRound(gameRoundId);
        this.gameRound.string = gameRound;

        const typingLabel = this.gameRound.node.parent.getComponent(TypingLabel);

        if (typingLabel) {
            if (this.timeHandler && this.timeHandler.isStartingNewGameRound) {
                typingLabel.playTypingEffect();
            } else {
                typingLabel.adjustWidth();
            }
        }
    }

    showProcessingWarning(show: boolean) {
        if (show) {
            if (this.processingWarning && this.processingWarning.isValid) {
                return;
            }
            const node = cc.instantiate(this.processWarningPrefab);
            this.noticeNode.addChild(node);
            this.processingWarning = node;
        } else {
            this.unlockBet();
            if (!this.processingWarning || !this.processingWarning.isValid) {
                return;
            }
            this.processingWarning.getComponent(ProcessingWarning).close();
            this.processingWarning = null;
        }
    }

    sendRetryMessage(): void {
        // handle
    }

    lockBet() {
        this.waitingProcessing = true;
        const intervalTime = 0.5; // 3 seconds
        this.schedule(this.sendRetryMessage, intervalTime, cc.macro.REPEAT_FOREVER, 0);
    }

    unlockBet() {
        this.waitingProcessing = false;
        this.unschedule(this.sendRetryMessage);
    }

    showUmMessage(data: any) {
        if (this.isDisableGame) {
            return;
        }

        uiManager.emitter.emit(InternalEvents.GAME_IS_UM, this.gameId);
        roundTimerManager.addDisabledGames(this.gameId);
        this.umNotice && this.umNotice.show(data);
    }

    showUmMessagePopup(data: any) {
        const message = NoticeUtil.getMessageByLocale(data.um_message);

        const text = message ? message : i18n.t("messages.disabledGame");
        const noticeData = { text: text, button: { text: "OK" } } as NoticeData;
        noticeData.button = { text: "OK" };
        this.showNotice(noticeData, null, () => {
            this.isReceivedUMData = false;
            this.closeGameByClick = true;
            this.onCloseGame();
        });
        uiManager.isPauseLoadingIcons = false;
    }

    showNotice(noticeData: NoticeData, onClickOk: () => void, onClose: () => void) {
        this.currentMiniPanel.showNotice(noticeData, onClickOk, onClose);
    }

    voidTicket(toLobby: false) {
        const backToLobby = () => {
            this.onCloseGame();
        };
        if (toLobby) {
            setTimeout(() => {
                this.onCloseGame();
            }, 10000);
            const noticeData = { text: i18n.t("messages.voidTicketMessage"), button: { text: "OK" } } as NoticeData;
            this.showNotice(noticeData, backToLobby, backToLobby);
        }
    }

    hideUmMessage() {
        this.umNotice && this.umNotice.hide();
        roundTimerManager.removeDisabledGames(this.gameId);
        this.isReceivedUMData = false;
    }

    clearAllNotices() {
        this.noticeNode.destroyAllChildren();
    }

    showMiniWarning(data): cc.Node {
        if (!this.node.activeInHierarchy) {
            return null;
        }
        const notice = cc.instantiate(this.miniNoticePrefab);
        const noticeComponent = notice.getComponent("mini_warning");
        this.updateMiniWarningContent(noticeComponent, data);
        this.noticeNode.addChild(notice);
        return notice;
    }

    updateMiniWarningContent(miniWarningComp, data: string) {
        miniWarningComp.text.string = data;
    }

    showMainTime(show: boolean) {
        if (this.animatedTime) {
            this.animatedTime.node.active = show;
        }
    }

    showWaittingTime(show: boolean) {
        if (this.timeWaitNode) {
            this.timeWaitNode.active = show;
        }
    }

    setWaitingTimeLabel(text: string) {
        if (this.timeWaitLabel) {
            this.timeWaitLabel.string = text;
        }
    }

    setMainTimeLabel(text: string) {
        if (this.animatedTime) {
            this.animatedTime.setTime(text);
        }
    }

    resetDataAndUI() {
        _.forEach(this.betItems, (item) => {
            item.clearBet();
            item.resetHighlight();
        });
        this.setGameRound(0);
        this.showMainTime(false);
        this.showWaittingTime(false);

        if (this.statusHandler) {
            this.statusHandler.clearStatusData();
        }
    }

    protected formatGameRound(gameRoundId: any) {
        return gameRoundId ? `#${gameRoundId}` : "";
    }

    protected onGameHide() {
        this.isGameHide = true;
        this.stopGame();
        this.stopAllSFX();
    }

    protected stopAllSFX() {
        this.gameAudios?.stopAllAudio();
    }

    protected onGameShow() {
        this.clearAllData();
        this.joinGame();
    }

    public clearAllData() {
        this.clearRoundHistory();
    }

    protected initBetChips() {
        if (this.enableChips && this.betChipsContainer) {
            const betChipsNode = cc.instantiate(this.betChipsPrefab);
            this.betChipsContainer.addChild(betChipsNode);
            this.initBetChipByLoader(betChipsNode);
        }
    }

    initBetChipByLoader(node: cc.Node) {
        this.betChips = node.getComponent(BetChips);
        this.betChips.init((bet) => {
            this.onChangedBetChip(bet);
        });

        this.betChips.enableStakeLevel = this.isUsingMaxStakeLevel();
    }

    protected onChangedBetChip(bet) {
        this.currentBet = parseInt(bet);
    }

    protected initGameAudios() {
        if (!this.gameAudiosPrefab) {
            return;
        }
        const gameAudiosNode = cc.instantiate(this.gameAudiosPrefab);
        this.gameAudios = gameAudiosNode.getComponent(GameAudios);
    }

    protected initHandlers() {
        this.umHandler = new GameBaseUmDataHandler(this);
        this.noticeHandler = new GameBaseNoticeHandler(this);
        this.statusHandler = new GameBaseStatusHandler(this);
        this.betHandler = new GameBaseBetHandler(this);
        this.timeHandler = new GameBaseTimeHandler(this);
        this.errorHandler = new GameBaseErrorHandler(this);
        this.logsHandler = new GameBaseLogsHandler(this);
        this.finishHandler = new GameBaseFinishHandler(this);
        this.configsHandler = new GameBaseConfigsHandler(this);
        this.md5Handler = new GameBaseMd5Handler(this);
        this.provablyFairHandler = new GameBaseProvablyFairHandler(this);
        this.oddsHandler = new GameBaseOddsHandler(this);
        this.voidTicketHandler = new GameBaseVoidTicketHandler(this);
        this.winnersHandler = new GameBaseWinnersHandler(this);
    }

    protected addHandlers(...handlers: DataHandler[]): void {
        const filterHandlers = handlers.filter((handler) => handler !== null);
        this.dataHandlers.push(...filterHandlers);
    }

    protected clearIntervalAndTimeout() {
        this.timeHandler && this.timeHandler.stopPlayTime();
        this.statusHandler && this.statusHandler.clearTimeout();
    }

    public updateOddsFromConfigs() {
        this.gameConfigs.odds && this.betItems.forEach((item) => item.setOdd(this.gameConfigs.odds[item.node.name]));
    }

    public applyPromotion(values) {
        this.betItems.forEach((item) => item.setOdd(values[item.node.name]));
    }

    setGameConfigs(gameConfigs: any) {
        this.gameConfigs = gameConfigs;
        this.updateDisplayForRemoteConfig();
    }

    setBoostedChoices(boostedChoices: any) {
        this.boostedChoices = boostedChoices;
        this.highLightBoostedOdds();
    }

    highLightBoostedOdds() {
        if (this.boostedChoices) {
            this.betItems.forEach((item) => item.highLightOdds(this.boostedChoices?.includes(item.node.name)));
        }
    }

    public updateDisplayForRemoteConfig() {
        this.updateOddsFromConfigs();

        if (!this.managedByContainer && this.betChips) {
            this.betChips.setChipValues(this.gameConfigs);
        }
    }

    public updateUserBalance() {
        this.node.activeInHierarchy && UserService.getBalance();
    }

    public isUsingMaxStakeLevel() {
        return true;
    }

    openGuide() {
        const dialog = cc.instantiate(this.guidePrefab);
        const guide = dialog.getComponent(WebViewGuide);
        const { minBet, maxBet } = this.getBetRange();
        const locale = getLocale();
        const isInPromotionTime = this.boostedChoices?.length > 0;
        const language = getLanguage(locale);
        this.handleGameGuide(guide, language, minBet, maxBet, isInPromotionTime);
    }

    openProvablyFair() {
        this.provablyFairComponent?.updateGameId(this.gameId);
        this.provablyFairComponent?.onShow();
    }

    handleGameGuide(guide: WebViewGuide, language, minBet, maxBet, isInPromotionTime) {
        guide.initURL(
            this.gameId,
            language,
            { minBet, maxBet, used: this.isUsingMaxStakeLevel() },
            isInPromotionTime,
            userManager.fractionalOddsFormat
        );
        guide.sendDataToIframe(this.gameConfigs);
        this.currentMiniPanel.showGuide(guide.node);
        guide.loadWebView();
    }

    protected openMD5Guide() {
        const dialog = cc.instantiate(this.guidePrefab);
        const guide = dialog.getComponent(WebViewGuide);
        const { minBet, maxBet } = this.getBetRange();
        const locale = getLocale();
        const language = getLanguage(locale);
        guide.initURL(
            this.gameId,
            language,
            { minBet, maxBet, used: this.isUsingMaxStakeLevel() },
            false,
            userManager.fractionalOddsFormat,
            "&md5=1"
        );
        guide.sendDataToIframe(this.gameConfigs);
        this.currentMiniPanel.showGuide(dialog);
        guide.loadWebView();
    }

    getBetRange() {
        return this.isUsingMaxStakeLevel() ? this.getVipBetRange() : this.getNormalBetRange();
    }

    getMaxBet(): number {
        return Math.min(this.gameConfigs.maxBet, userManager.stakeLevel.maxBet);
    }

    getMinBet(): number {
        return Math.max(this.gameConfigs.minBet, userManager.stakeLevel.minBet);
    }

    protected getNormalBetRange() {
        const { minBet, maxBet } = this.gameConfigs;
        return {
            minBet: minBet,
            maxBet: maxBet
        };
    }

    protected getVipBetRange() {
        return userManager.stakeLevel;
    }

    showMiniWarningLimitBetChanged() {
        this.showMiniWarning(i18n.t("messages.limitBetChanged"));
    }

    updateUserStakeLevel(data): boolean {
        let updated = false;

        if (data.maxBet && data.minBet && this.node.activeInHierarchy) {
            updated = userManager.updateUserStakeLevel(data);
        }
        return updated;
    }

    public playClick() {
        AudioManager.getInstance().playClick();
    }

    getBetChoiceString(choice: string): string {
        return GameUtils.getBetChoiceString(choice);
    }

    onIngameMenuInitialized(node: cc.Node) {
        const inGameMenu = node.getComponent(InGameMenu);
        if (inGameMenu) {
            this.inGameMenu = inGameMenu;
            this.initEventForInGameMenu();
        }
    }

    initEventForInGameMenu(): cc.Node {
        const node = this.inGameMenu.node;

        node.on(InGameMenuEvents.OPEN_HISTORY, this.openHistory, this);
        node.on(InGameMenuEvents.OPEN_GUIDE, this.openGuide, this);
        node.on(InGameMenuEvents.CLOSE_GAME, this.onCloseGame, this);
        node.on(InGameMenuEvents.OPEN_PROVABLY_FAIR, this.openProvablyFair, this);
        return node;
    }

    isShowingUM(data) {
        return data.um && this.checkShowUmMessage(data);
    }

    checkShowUmMessage(data: any) {
        return this.currentTimeRemaining <= this.config.betTime || data.remainingTime === this.config.fullTime;
    }

    checkHideUmMessage(data: any) {
        return this.hideUmDataKeys.some((key) => data[key] !== undefined);
    }

    openHistory() {
        // handle
    }

    onCloseGame() {
        // handle
    }

    needShowNextDot() {
        return !this.needHideNextDotRoundHistory && this.normalShowNextDotCondition();
    }

    normalShowNextDotCondition() {
        return this.currentTimeRemaining < this.config.stopBetTime || this.currentTimeRemaining > this.config.fullTime;
    }

    saveSettingKey(key: string, value: any) {
        const gameSetting = GameUtils.getGameSetting(this.gameId);
        gameSetting[key] = value;
        GameUtils.setGameSetting(this.gameId, gameSetting);
    }

    getSettingKey(key: string) {
        const gameSetting = GameUtils.getGameSetting(this.gameId);
        return gameSetting[key];
    }

    onClickMaximize() {
        this.maximizeCallback(this.gameId);
    }

    tween(node: cc.Node) {
        if (!this.internalTweenNodes.includes(node)) {
            this.internalTweenNodes.push(node);
        }
        return cc.tween(node).tag(this.internalTweenTag);
    }

    stopInternalTweens() {
        this.internalTweenNodes.forEach((node) => node.stopActionByTag(this.internalTweenTag));
    }

    clearGameData() {
        GameDataManager.getInstance().clearGameData(this.gameId);
    }

    initGameData() {
        const dataManager = GameDataManager.getInstance();
        let gameData = dataManager.getGameData(this.gameId);
        if (!gameData) {
            gameData = this.createGameData();
            dataManager.setGameData(this.gameId, gameData);
        }

        this.gameData = gameData;
        this.gameData.durations.initialize({
            wholeRound: this.config.fullTime,
            placingBet: this.config.betTime,
            lockingBet: this.config.stopBetTime
        });
    }

    createGameData(): GameData {
        return new GameData();
    }

    emitterListener(emitter: EventEmitterBase, eventName: string, listener: (param: any) => any) {
        const storage = {
            emitter,
            eventName,
            listener: listener(this)
        };
        emitter.addListener(eventName, storage.listener);
        this.emitterStorages.push(storage);
    }

    removeGameDataEvents() {
        this.emitterStorages.forEach((item) => {
            const { emitter, eventName, listener } = item;
            emitter.removeListener(eventName, listener);
        });
        this.emitterStorages = [];
    }

    clearData() {
        this.gameData?.clearData();
    }

    cleanGame() {
        // handle
    }

    grantSocket() {
        // handle
    }

    initSocketListener() {
        // handle
    }

    sendSocketData(eventName: string, data: any) {
        this.socket && this.socket.connected && this.socket.emit(eventName, data);
    }

    public sendBetAtChoice(choice: string, bet: number) {
        const betData = {
            amount: bet,
            betChoice: choice,
            username: userManager.userName,
            clientSentTime: new Date()
        };

        this.sendSocketData("bet", betData);
    }

    public onBetItemClick(e) {
        this.handleBetItemClick(e.target.name);
    }

    handleBetItemClick(choice: string) {
        if (!this.isReadyBet()) {
            return;
        }
        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
        } else {
            this.lockBet();
            this.sendBetAtChoice(choice, this.currentBet);
        }
    }

    addOrientationData(data: any) {
        data["m"] = `${this.orientation + 1}`;
    }

    onInitializeRebetButton(node: cc.Node) {
        this.rebetButton = node.getComponent(RebetButton);
        node.on("click", this.onClickRebet.bind(this));

        this.loadRebetStorage();
        this.updateRebetButtonStatus();
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Show,
            object_name: "RebetButton",
            game_name: GameUtils.getGameNameString(this.gameId)
        });
    }

    updateRebetButtonStatus() {
        this.rebetButton && (this.rebetButton.interactable = this.checkRebetStatus());
    }

    disableRebetButton() {
        if (this.rebetButton) {
            this.rebetButton.interactable = false;
        }
    }

    onClickRebet() {
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Click,
            object_name: "RebetButton",
            game_name: GameUtils.getGameNameString(this.gameId)
        });
        AudioManager.getInstance().playClick();
        if (!this.isReadyBet()) {
            return;
        }
        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
        } else {
            this.lockBet();
            this.sendRebetData();
        }
    }

    sendRebetData() {
        const betData = {};
        this.addOrientationData(betData);
        this.sendSocketData("rebet", betData);
    }

    isPlacingBet() {
        if (!this.timeHandler) {
            console.error("Warning should check isPlacingBet without time-handler");
            return false;
        }
        return !this.timeHandler.isInLockBetTime && this.timeHandler.isInRoundTime;
    }

    checkRebetStatus(): boolean {
        if (!this.previousOwnBets || !this.isPlacingBet()) {
            return false;
        }

        const { roundId, ownBets } = this.previousOwnBets;
        return roundId === this.roundId - 1 && ownBets && Object.keys(ownBets).length > 0;
    }

    loadRebetStorage() {
        const storage = GameUtils.getSpecificGameSetting(this.gameId);
        const { rebet } = storage;
        if (rebet) {
            this.previousOwnBets = rebet;
        }
    }

    saveRebetStorage(data: any) {
        if (!data) {
            return;
        }
        const { roundId, ownBets } = data;
        if (ownBets && roundId > 0) {
            const storage = GameUtils.getSpecificGameSetting(this.gameId);
            storage.rebet = data;
            GameUtils.setSpecificGameSetting(this.gameId, storage);
        }
    }

    getCurrentStatusData() {
        return this.statusHandler.currentStatusData;
    }

    payChipToAllPlayers(info: PayChipInfo) {
        const { mainRoomGame } = info;
        payChipsToLoginPlayer(info, mainRoomGame.otherPlayers !== null);

        this.showPayoutForLoginPlayer(mainRoomGame);

        if (mainRoomGame.otherPlayers) {
            payChipsToOtherPlayers(info);
        }

        payChipsToInGamePlayers(info);
        this.inSettlementSequence = false;
        this.isDonePayingChip = true;
    }

    showPayoutForLoginPlayer(mainRoomGame: TableGameBaseInterface) {
        showPayoutForLoginPlayer(mainRoomGame);
    }

    initMD5String(node: cc.Node) {
        this.md5Component = node.getComponent(MD5Component);
        this.md5Component.gameId = this.gameId;
    }

    initProvablyFair(node: cc.Node) {
        this.provablyFairComponent = node.getComponent(ProvablyFairComponent);
        if (this.provablyFairComponent) {
            this.node.on(InGameMenuEvents.OPEN_PROVABLY_FAIR, this.openProvablyFair, this);
            this.provablyFairComponent.onHide();
            this.provablyFairComponent.miniPanel = this.currentMiniPanel;
        }
    }

    onClickProvablyFair() {
        this.node.emit(InGameMenuEvents.OPEN_PROVABLY_FAIR);
    }

    handleProvablyFairVerifyData(provablyFair: any) {
        provablyFair && this.historyComponent?.provablyFairVerifyComponent?.updateProvablyFairVerify(provablyFair);
    }

    shouldShowWinningEffect() {
        return this.timeHandler.isInWaitTime && this.isDonePayingChip;
    }

    getPromptMessageComponent() {
        if (!this.promptMessageComponent) {
            const node = GameUtils.createNodeFromPrefab(this.promptMessagePrefab);
            if (node) {
                this.promptMessageContainer.addChild(node);
                this.promptMessageComponent = node.getComponent(PromptMessageComponent);
            }
        }

        return this.promptMessageComponent;
    }
}
