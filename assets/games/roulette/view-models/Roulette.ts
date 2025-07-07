import * as i18n from "i18n/runtime-scripts/LanguageData";
import * as _ from "lodash";

import GameUtils from "../../../common/GameUtils";
import AudioManager from "../../../common/audio/AudioManager";
import * as sessionManager from "../../../common/auth/SessionManager";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { InGameMenuEvents } from "../../../common/in-game-menu/InGameMenu";
import { userManager } from "../../../common/user/UserManager";
import SocketIOTableGameBase from "../../_base/SocketIOTableGameBase";
import BottomControls from "./BottomControls";
import LeftControls from "./LeftControls";
import { RouletteConfigs } from "./RouletteConfigs";
import RouletteHistory from "./RouletteHistory";
import RouletteMain from "./RouletteMain";
import RouletteMiniRoundResult from "./RouletteMiniRoundResult";
import RouletteStatistic from "./RouletteStatistic";
import RouletteUtils from "./RouletteUtils";
import TopControls from "./TopControls";
import RouletteBetHandler from "./handlers/RouletteBetHandler";
import RouletteFinishHandler from "./handlers/RouletteFinishHandler";
import RouletteLogsHandler from "./handlers/RouletteLogsHandler";
import RouletteTimeHandler from "./handlers/RouletteTimeHandler";

const { ccclass, property } = cc._decorator;

export interface RouletteBetInfo {
    type: string;
    numbers: number[];
}

export const RouletteId = 21;

@ccclass
export default class Roulette extends SocketIOTableGameBase {
    @property(cc.Node)
    mainContainer: cc.Node = null;

    @property(RouletteMiniRoundResult)
    miniRoundResult: RouletteMiniRoundResult = null;

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    statisticPrefab: cc.Prefab = null;

    @property(cc.Label)
    totalBetLabel: cc.Label = null;

    @property(cc.Label)
    tempBetLabel: cc.Label = null;

    @property(cc.Node)
    topContainer: cc.Node = null;

    @property(cc.Node)
    bottomContainer: cc.Node = null;

    @property(cc.Node)
    leftContainer: cc.Node = null;

    @property(cc.Node)
    roundIdContainer: cc.Node = null;

    topControls: TopControls = null;
    bottomControls: BottomControls = null;
    leftControls: LeftControls = null;

    doubleButton: cc.Button = null;
    rebetButton: cc.Button = null;
    undoButton: cc.Button = null;
    clearButton: cc.Button = null;
    confirmButton: cc.Button = null;
    confirmGlow: cc.Node = null;

    rouletteMain: RouletteMain;

    tempBetChoices: any = {};
    currentBetChoices: any = {};
    previousRoundBetChoices: any = {};
    betChoicesStack = [];
    isPlacingChip = false;
    override usingNewSettlement = true;
    statisticComponent: RouletteStatistic;
    readonly chipOption: number[] = [];

    constructor() {
        super();
        this.gameId = RouletteId;
        this.setConfig(new RouletteConfigs());
    }

    initHandlers() {
        super.initHandlers();

        this.finishHandler = new RouletteFinishHandler(this);
        this.logsHandler = new RouletteLogsHandler(this);
        this.timeHandler = new RouletteTimeHandler(this);
        this.betHandler = new RouletteBetHandler(this);
    }

    onLoad() {
        this.roundIdContainer.opacity = 0;
        cc.director.on(cc.Director.EVENT_BEFORE_DRAW, this.setDefaultPositionForMiniMenu, this);

        sessionManager.storeInRoomGameId(RouletteId); // fix bug hide the back-to-lobby button when SSO direct (ref = d_direct) to game.
        this.initMain().then(() => {
            this.initBetBoard();
            super.onLoad();
            this.updateTotalBetLabel();
            this.updateBetStatus(true);
            this.schedule(this.updateBetStatus, 0.3, cc.macro.REPEAT_FOREVER, 1);
            this.joinGame();
            this.rouletteMain.board.betChips = this.betChips;
        });
    }

    setDefaultPositionForMiniMenu() {
        if (!this.currentMiniPanel?.popupMiniGame || !this.rouletteMain.newMenuPosition) {
            return;
        }

        const wPosition = this.rouletteMain.newMenuPosition.convertToWorldSpaceAR(cc.v2(0, 0));
        const localPosition = this.currentMiniPanel.miniMenu.convertToNodeSpaceAR(wPosition);
        const defaultPosition = cc.v3(localPosition);

        this.currentMiniPanel.popupMiniGame.setDefaultPosition(defaultPosition);
        cc.director.off(cc.Director.EVENT_BEFORE_DRAW, this.setDefaultPositionForMiniMenu, this);
    }

    setGameRound(gameRoundId) {
        super.setGameRound(gameRoundId);
        this.roundIdContainer.opacity = 255;
    }

    onDestroy() {
        cc.director.off(cc.Director.EVENT_BEFORE_DRAW, this.setDefaultPositionForMiniMenu, this);
        super.onDestroy();
        this.unschedule(this.updateBetStatus);
    }

    updateBetStatus(forceUpdate = false) {
        if (this.currentTimeRemaining > this.config.betTime || !forceUpdate) {
            return;
        }

        const tempLength = Object.keys(this.tempBetChoices).length;
        const currentLength = Object.keys(this.currentBetChoices).length;
        const previosRoundLength = Object.keys(this.previousRoundBetChoices).length;

        this.rebetButton.node.active = tempLength === 0 && currentLength === 0 && previosRoundLength > 0;
        this.rebetButton.interactable = this.currentTimeRemaining > this.config.stopBetTime;
        this.doubleButton.node.active = !this.rebetButton.node.active;

        this.clearButton.interactable = tempLength > 0;
        this.doubleButton.interactable = tempLength > 0;
        this.undoButton.interactable = tempLength > 0;
        if (this.confirmButton.interactable !== tempLength > 0) {
            this.confirmButton.node.parent.stopAllActions();
            this.confirmGlow.active = false;
            this.confirmButton.node.scale = 1;
            if (!this.confirmButton.interactable) {
                cc.tween(this.confirmButton.node.parent)
                    .repeatForever(
                        cc.tween().to(0.15, { scale: 0.9 }).to(0.1, { scale: 1 }).to(0.1, { scale: 0.9 }).to(0.1, { scale: 1 }).delay(1)
                    )
                    .start();

                this.confirmGlow.active = true;
            }
        }
        this.confirmButton.interactable = tempLength > 0;

        //update disable frame
        this.clearButton.node.children[1].active = !this.clearButton.interactable;
        this.doubleButton.node.children[1].active = !this.doubleButton.interactable;
        this.confirmButton.node.children[1].active = !this.confirmButton.interactable;
        this.undoButton.node.children[1].active = !this.undoButton.interactable;
        this.rebetButton.node.children[1].active = !this.rebetButton.interactable;
    }

    resetDataAndUI() {
        super.resetDataAndUI();
    }

    async initMain() {
        const node = await this.loadResource("RouletteMain", this.mainContainer);
        this.rouletteMain = node.getComponent(RouletteMain);
        this.rouletteMain.rearrangeIndexCallback = (type: number) => {
            this.rearrangeIndex(type);
            if (type === 1) {
                //quickBet
                this.leftControls.collapseMenu();
            }
        };
        this.timeWaitLabel = this.rouletteMain.timeWaitLabel;
        this.timeWaitNode = this.rouletteMain.timeWaitNode;
        this.animatedTime = this.rouletteMain.animatedTime;

        const bottomControlsNode = await this.loadResource("BottomControls", this.bottomContainer);
        this.bottomControls = bottomControlsNode.getComponent(BottomControls);
        this.bottomControls.doubleButton.node.on("click", this.onPressedDouble, this);
        this.bottomControls.clearButton.node.on("click", this.onPressedClear, this);
        this.bottomControls.rebetButton.node.on("click", this.onPressedRebet, this);
        this.bottomControls.confirmButton.node.on("click", this.onPressedConfirm, this);
        this.bottomControls.undoButton.node.on("click", this.onPressedUndo, this);

        this.betChipsContainer = this.bottomControls.betChipsContainer;
        this.doubleButton = this.bottomControls.doubleButton;
        this.clearButton = this.bottomControls.clearButton;
        this.rebetButton = this.bottomControls.rebetButton;
        this.confirmButton = this.bottomControls.confirmButton;
        this.confirmGlow = this.bottomControls.confirmGlow;
        this.undoButton = this.bottomControls.undoButton;

        const topControlsNode = await this.loadResource("TopControls", this.topContainer);
        this.topControls = topControlsNode.getComponent(TopControls);
        this.players = this.topControls.players;
        this.otherPlayers = this.topControls.otherPlayers;

        const leftControlsNode = await this.loadResource("LeftControls", this.leftContainer);
        this.leftControls = leftControlsNode.getComponent(LeftControls);
        this.initIngameMenuFromLeftControl();
    }

    private initIngameMenuFromLeftControl() {
        const node = this.leftControls.ingameMenu.node;

        node.on(InGameMenuEvents.OPEN_HISTORY, this.openHistory, this);
        node.on(InGameMenuEvents.OPEN_GUIDE, this.openGuide, this);
        node.on(InGameMenuEvents.OPEN_STATISTIC, this.openStatistic, this);
        node.on(InGameMenuEvents.GO_TO_LOBBY, this.onCloseGameClick, this);
    }

    onUserProfileInitialized(node: cc.Node) {
        super.onUserProfileInitialized(node);
        this.userProfile.node.scale = this.isMobile() ? 0.8 : 1;
    }

    isMobile(): boolean {
        return cc.sys.isMobile;
    }

    rearrangeIndex(type: number) {
        const items = [];
        if (this.isMobile()) {
            switch (type) {
                case 0: //regular
                    items.push(
                        ...[
                            this.roundIdContainer,
                            this.mainContainer,
                            this.leftContainer,
                            this.bottomContainer,
                            this.userProfile.node.parent,
                            this.noticeNode
                        ]
                    );
                    break;
                case 1: //quickBet
                    items.push(
                        ...[
                            this.leftContainer,
                            this.mainContainer,
                            this.bottomContainer,
                            this.roundIdContainer,
                            this.userProfile.node.parent,
                            this.noticeNode
                        ]
                    );
                    break;
                case 2: //show results
                    items.push(
                        ...[
                            this.roundIdContainer,
                            this.leftContainer,
                            this.bottomContainer,
                            this.userProfile.node.parent,
                            this.mainContainer,
                            this.noticeNode
                        ]
                    );
                    break;
                default:
                    break;
            }
        } else {
            switch (type) {
                case 0:
                case 1:
                    items.push(...[this.roundIdContainer, this.mainContainer, this.leftContainer, this.bottomContainer, this.noticeNode]);
                    break;
                case 2: //show results
                    items.push(...[this.roundIdContainer, this.leftContainer, this.bottomContainer, this.mainContainer, this.noticeNode]);
                    break;
                default:
                    break;
            }
        }
        items.forEach((item, index) => {
            item.zIndex = index;
        });
    }

    async loadResource(name: string, container: cc.Node) {
        const suffix = this.isMobile() ? `_mobile` : ``;
        const path = `games/roulette/${name}${suffix}`;
        const prefab = await GameUtils.loadResource(path);
        const node = cc.instantiate(prefab);
        container.addChild(node);
        return node;
    }

    initBetBoard() {
        const chipFlyingDuration = 0.3;
        this.rouletteMain.board.callback.selected = (betInfo: RouletteBetInfo) => {
            this.leftControls.collapseMenu();
            if (this.isDisablePlaceChip()) {
                return;
            }
            this.isPlacingChip = true;

            if (!this.checkAvailableBalance(this.currentBet)) {
                this.isPlacingChip = false;
                return;
            }

            const key = RouletteUtils.getKey(betInfo);
            const betChoices = {};
            betChoices[betInfo.type] = {};
            betChoices[betInfo.type][key] = this.currentBet;

            if (!this.checkAvailableBetChoices(betChoices)) {
                this.isPlacingChip = false;
                return;
            }

            const destNode = this.rouletteMain.board.getBetNodeByKey(betInfo.type, RouletteUtils.getKey(betInfo));
            const chipNode = RouletteUtils.createChip(this.currentBet, this.betChips);

            this.addBetChoice(betInfo, this.currentBet);
            this.addToBetChoicesStack(betChoices);
            const objectData = {
                chipNode: chipNode,
                bet: this.currentBet,
                destNode: destNode,
                startNode: null,
                onComplete: () => {
                    this.addBetChoiceOnBoard(betInfo, this.currentBet);
                },
                delayDestroy: 0,
                duration: chipFlyingDuration,
                fadeDuration: 1
            };
            this.betChips.moveChipWithCallback(objectData);
        };

        this.rouletteMain.quickBet.callback.getCurrentBet = () => this.currentBet;
        this.rouletteMain.quickBet.callback.selected = (betChoices: any) => {
            this.leftControls.collapseMenu();
            if (this.isDisablePlaceChip()) {
                return;
            }
            this.isPlacingChip = true;

            const sum = this.sumValueBetChoices(betChoices);
            if (!this.checkAvailableBalance(sum)) {
                this.isPlacingChip = false;
                return;
            }

            if (!this.checkAvailableBetChoices(betChoices)) {
                this.isPlacingChip = false;
                return;
            }

            for (const type in betChoices) {
                for (const key in betChoices[type]) {
                    const betInfo = { type: type, numbers: RouletteUtils.parseKeyToNumbers(key) };
                    const bet = betChoices[type][key];
                    const destNode = this.rouletteMain.board.getBetNodeByKey(betInfo.type, key);
                    const chipNode = RouletteUtils.createChips(bet, this.betChips);

                    this.addBetChoice(betInfo, bet);
                    const objectData = {
                        chipNode: chipNode,
                        bet: bet,
                        destNode: destNode,
                        startNode: null,
                        onComplete: this.addBetChoiceOnBoard.bind(this, betInfo, bet),
                        delayDestroy: 0,
                        duration: chipFlyingDuration,
                        fadeDuration: 1
                    };
                    this.betChips.moveChipWithCallback(objectData);
                }
            }
            this.addToBetChoicesStack(betChoices);
        };
    }

    addBetChoiceOnBoard(betInfo: any, bet: any) {
        this.rouletteMain.board.addBetChoice(betInfo, bet);
        this.isPlacingChip = false;
    }

    clearTempBetChoices() {
        this.tempBetChoices = {};
        this.betChoicesStack = [];
        this.isPlacingChip = false;
        this.rouletteMain.board.showBetChoices(this.currentBetChoices, this.currentBetChoices);

        this.updateTotalBetLabel();
        this.rouletteMain.board.showBetDetailTips();
        this.rouletteMain.board.clearHighlight();
    }

    clearCurrentBetChoices() {
        this.currentBetChoices = {};
        this.rouletteMain.board.showBetChoices(this.currentBetChoices, this.currentBetChoices);
        this.rouletteMain.board.showBetDetailTips();
        this.updateTotalBetLabel();
    }

    checkAvailableBalance(bet: number): boolean {
        const total = this.sumValueBetChoices(this.tempBetChoices);
        const available = total + bet <= userManager.balance;

        !available && this.showMiniWarning(i18n.t("messages.notEnoughMoney"));
        return available;
    }

    sumValueBetChoices(totalChoices: any) {
        let total = 0;
        for (const type in totalChoices) {
            for (const key in totalChoices[type]) {
                total += totalChoices[type][key];
            }
        }
        return total;
    }

    checkAvailableBetChoices(betChoices): boolean {
        if (!this.gameConfigs) {
            return false;
        }
        let totalChoices = {};
        totalChoices = this.mergeBetChoices(totalChoices, this.currentBetChoices);
        totalChoices = this.mergeBetChoices(totalChoices, this.tempBetChoices);

        const isMultiChoices = Object.keys(betChoices).length > 1 || Object.keys(betChoices[Object.keys(betChoices)[0]]).length > 1;

        for (const type in betChoices) {
            for (const key in betChoices[type]) {
                if (this.showWarningOnBetChoices(betChoices, totalChoices, type, key, isMultiChoices)) {
                    return false;
                }
            }
        }

        const currentTotal = this.sumValueBetChoices(totalChoices);
        const newTotal = this.sumValueBetChoices(betChoices);
        const maxBet = this.getMaxBet();
        if (currentTotal + newTotal > maxBet) {
            this.showMiniWarning(i18n.t("messages.maxBetNotice", { maxBet: numberWithCommas(maxBet) }));
            return false;
        }

        return true;
    }

    showWarningOnBetChoices(betChoices: any, totalChoices: any, type: any, key: any, isMultiChoices: boolean): boolean {
        const maxBet = this.getMaxBet();
        const text = isMultiChoices
            ? i18n.t("messages.maxBetOfAnyChoiceReached")
            : i18n.t("messages.maxBetForChoiceNotice", {
                  maxBet: numberWithCommas(Math.min(this.gameConfigs.maxBetPerChoices[type], maxBet))
              });
        if (betChoices[type][key] > this.gameConfigs.maxBetPerChoices[type]) {
            this.showMiniWarning(text);
            return true;
        }
        if (totalChoices[type] && totalChoices[type][key]) {
            const total = totalChoices[type][key] + betChoices[type][key];
            if (total > this.gameConfigs.maxBetPerChoices[type]) {
                this.showMiniWarning(text);
                return true;
            }
        }

        return false;
    }

    isDisablePlaceChip(): boolean {
        if (!this.isReadyBet() || this.isPlacingChip) {
            return true;
        }

        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
            return true;
        }

        if (this.currentTimeRemaining < this.config.stopBetTime || this.currentTimeRemaining > this.config.betTime - 1) {
            this.showMiniWarning(i18n.t("messages.placeBetNextRound"));
            return true;
        }

        return false;
    }

    addBetChoice(betInfo: RouletteBetInfo, bet: number) {
        const key = RouletteUtils.getKey(betInfo);
        if (!this.tempBetChoices[betInfo.type]) {
            this.tempBetChoices[betInfo.type] = {};
        }
        const current = this.tempBetChoices[betInfo.type][key] || 0;
        this.tempBetChoices[betInfo.type][key] = current + bet;

        this.updateTotalBetLabel();
    }

    showWheelResult(result: number, onComplete: () => void) {
        this.rouletteMain.showRoulette(result, onComplete);
        this.leftControls.collapseMenu();
    }

    updateMiniRoundResult(animated = false) {
        const data = this.currentDataLogs.map((log) => log.result);
        this.miniRoundResult.setData(data, animated);
        if (this.currentTimeRemaining > this.config.stopBetTime) {
            this.rouletteMain.highlightLastResult(data[0], animated);
        }
    }

    playClick() {
        AudioManager.getInstance().playClick();
    }

    addToBetChoicesStack(betChoices: any) {
        this.betChoicesStack.push(betChoices);
    }

    onPressedDouble() {
        if (this.isDisablePlaceChip()) {
            return;
        }

        const temp = _.cloneDeep(this.tempBetChoices);
        const sum = this.sumValueBetChoices(temp);
        if (!this.checkAvailableBalance(sum)) {
            return;
        }

        if (!this.checkAvailableBetChoices(temp)) {
            return;
        }

        this.betChips.playSingleChipsSound();

        this.addToBetChoicesStack(temp);
        this.tempBetChoices = this.mergeBetChoices(this.tempBetChoices, temp);
        this.updateBetChoicesOnBoard();
    }

    mergeBetChoices(betChoices1: any, betChoices2: any): any {
        const total = _.cloneDeep(betChoices1);
        for (const type in betChoices2) {
            for (const key in betChoices2[type]) {
                if (total[type]) {
                    if (total[type][key]) {
                        total[type][key] += betChoices2[type][key];
                    } else {
                        total[type][key] = betChoices2[type][key];
                    }
                } else {
                    total[type] = {};
                    total[type][key] = betChoices2[type][key];
                }
            }
        }
        return total;
    }

    subtractBetChoices(betChoices1: any, betChoices2: any): any {
        const result = _.cloneDeep(betChoices1);
        for (const type in betChoices2) {
            for (const key in betChoices2[type]) {
                if (result[type] && result[type][key]) {
                    result[type][key] -= betChoices2[type][key];
                    if (result[type][key] === 0) {
                        delete result[type][key];
                    }
                }
            }

            if (Object.keys(result[type]).length === 0) {
                delete result[type];
            }
        }
        return result;
    }

    getCurrentTotalBetChoices(): any {
        let totalBetChoices = {};
        totalBetChoices = this.mergeBetChoices(totalBetChoices, this.tempBetChoices);
        totalBetChoices = this.mergeBetChoices(totalBetChoices, this.currentBetChoices);
        return totalBetChoices;
    }

    updateBetChoicesOnBoard() {
        const totalBetChoices = this.getCurrentTotalBetChoices();
        this.rouletteMain.board.showBetChoices(totalBetChoices, this.currentBetChoices);
        this.rouletteMain.board.showBetDetailTips();
        this.updateTotalBetLabel();
    }

    updateTotalBetLabel() {
        const totalBetChoices = this.currentBetChoices;
        const total = this.sumValueBetChoices(totalBetChoices);
        const newTotal = numberWithCommas(total);
        if (newTotal !== this.totalBetLabel.string) {
            this.totalBetLabel.string = newTotal;
            this.totalBetLabel.node.runAction(cc.repeat(cc.sequence(cc.scaleTo(0.15, 1.2), cc.scaleTo(0.15, 1.0)), 2));
        }

        const tempValue = this.sumValueBetChoices(this.tempBetChoices);
        const newTempValue = numberWithCommas(tempValue);
        if (this.tempBetLabel.string !== newTempValue) {
            this.tempBetLabel.string = newTempValue;
            this.tempBetLabel.node.runAction(cc.repeat(cc.sequence(cc.scaleTo(0.15, 1.2), cc.scaleTo(0.15, 1.0)), 2));
        }
    }

    onPressedUndo() {
        this.playClick();

        if (this.betChoicesStack.length === 0) {
            return;
        }

        const lastBetChoices = this.betChoicesStack.pop();
        this.tempBetChoices = this.subtractBetChoices(this.tempBetChoices, lastBetChoices);

        this.updateBetChoicesOnBoard();
    }

    onPressedClear() {
        this.playClick();
        this.clearTempBetChoices();
    }

    onPressedRebet() {
        if (this.isDisablePlaceChip()) {
            return;
        }

        this.betChips.playSingleChipsSound();

        this.tempBetChoices = _.cloneDeep(this.previousRoundBetChoices);
        this.addToBetChoicesStack(this.tempBetChoices);
        this.updateBetChoicesOnBoard();
    }

    onPressedConfirm() {
        this.playClick();
        if (this.isEmptyBetChoices()) {
            return;
        }
        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
            return;
        }

        this.lockBet();
        this.socket.emit("bet", {
            roundId: this.roundId,
            betChoices: this.tempBetChoices,
            clientSentTime: new Date()
        });
    }

    isEmptyBetChoices(): boolean {
        return Object.keys(this.tempBetChoices).length === 0;
    }

    public openStatistic() {
        this.playClick();
        const dialog = cc.instantiate(this.statisticPrefab);
        const statisticData = this.currentDataLogs.map((log) => log.result);
        this.statisticComponent = dialog.getComponent(RouletteStatistic);
        this.statisticComponent.generateStatistic(statisticData);

        this.currentMiniPanel.node.addChild(dialog);
    }

    public openHistory() {
        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(RouletteHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(dialog);
    }

    protected formatGameRound(gameRoundId: any) {
        return gameRoundId ? `#${gameRoundId}` : "";
    }

    getBetChoiceString(choice: string): string {
        const choices = { big: "19 - 36", small: "1 - 18" };

        if (Object.keys(choices).includes(choice)) {
            return choices[choice];
        }

        return super.getBetChoiceString(choice);
    }
}
