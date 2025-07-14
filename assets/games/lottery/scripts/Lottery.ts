import AudioManager from "../../../common/audio/AudioManager";
import ExpandableMenu from "../../../common/expandable-menu/view-models/ExpandableMenu";
import GameUtils from "../../../common/GameUtils";
import SocketIOTableGameBase from "../../_base/SocketIOTableGameBase";
import LotteryBetHandler from "./handlers/LotteryBetHandler";
import LotteryFinishHandler from "./handlers/LotteryFinishHandler";
import LotteryLogsHandler from "./handlers/LotteryLogsHandler";
import LotteryStatusHandler from "./handlers/LotteryStatusHandler";
import LotteryTimeHandler from "./handlers/LotteryTimeHandler";
import LabelItem from "./LabelItem";
import { LotteryChoicesBoard } from "./LotteryChoicesBoard";
import LotteryExtraResult from "./LotteryExtraResult";
import LotteryGameConfig from "./LotteryGameConfig";
import LotteryHelper from "./LotteryHelper";
import LotteryHistory from "./LotteryHistory";
import LotteryLargeNumberBoard from "./LotteryLargeNumberBoard";
import LotteryMiniRoundHistory from "./LotteryMiniRoundHistory";
import LotteryNumberItem from "./LotteryNumberItem";
import LotteryResult from "./LotteryResult";
import LotteryTypeItem from "./LotteryTypeItem";

const { ccclass, property } = cc._decorator;

export enum ChoiceType {
    Set27 = 0,
    Set4,
    Special,
    Head,
    Tail,
    Others,
    Parlay2,
    Parlay3,
    Parlay4
}

export const LotteryId = 31;

@ccclass
export default class Lottery extends SocketIOTableGameBase {
    @property(cc.Node)
    headerContainer: cc.Node = null;

    @property({ type: LotteryChoicesBoard })
    boards: LotteryChoicesBoard[] = [];

    @property({ type: LabelItem })
    lastSpecialNumbers: LabelItem[] = [];

    @property(cc.Label)
    lastRoundId: cc.Label = null;

    @property(cc.Label)
    totalBet: cc.Label = null;

    @property(cc.Prefab)
    resultPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    playWinningPrefab: cc.Prefab = null;

    @property(cc.Node)
    resultContainer: cc.Node = null;

    @property(cc.Node)
    winningBetLocation: cc.Node = null;

    @property({ type: LotteryMiniRoundHistory })
    miniRoundHistories: LotteryMiniRoundHistory[] = [];

    @property(cc.Toggle)
    statsToggle: cc.Toggle = null;

    @property(cc.Node)
    bettingNotice: cc.Node = null;

    @property(cc.Node)
    stoppingBetNotice: cc.Node = null;

    lotteryTypeItems: LotteryTypeItem[] = [];
    currentTypeIndex = 0;
    displayResultTime = 7;
    selectedItems: string[] = [];
    result: LotteryResult = null;
    extraResult: LotteryExtraResult = null;
    ownBets: any = {};
    stats = {};
    resultTween: cc.Tween;
    winningTween: cc.Tween;
    expandableMenu: ExpandableMenu = null;

    constructor() {
        super();
        this.gameId = LotteryId;
        this.setConfig(new LotteryGameConfig());
    }

    onLoad() {
        super.onLoad();
        this.showLastSpecialResult(false);
        this.headerContainer.children.forEach((child) => {
            const item = child.getComponent(LotteryTypeItem);
            if (item) {
                this.lotteryTypeItems.push(item);
            }
        });
        this.boards.forEach((board) => {
            board.onChoiceBet = (name) => this.onChoiceBet(name);
            const largeNumberboard = board.getComponent(LotteryLargeNumberBoard);
            if (largeNumberboard) {
                largeNumberboard.pageView.node.on("page-turning", this.updateSettingStorage, this);
            }
        });
        this.animatedTime.setAnimatedY(15, 0);
        this.animatedTime.setRedTime(this.config.stopBetTime);
        this.initMiniHistories();
    }

    protected onChangedBetChip(bet) {
        super.onChangedBetChip(bet);
        this.expandableMenu?.collapseMenu();
    }

    start() {
        this.loadPreviousSelection();
    }

    loadPreviousSelection() {
        const settings = GameUtils.getGameSetting(this.gameId);
        if (settings.currentTypeIndex) {
            this.currentTypeIndex = settings.currentTypeIndex;
            this.lotteryTypeItems[this.currentTypeIndex].toggle.isChecked = true;
            const board = this.getCurrentBoard();
            const largeNumberboard = board.getComponent(LotteryLargeNumberBoard);
            if (largeNumberboard) {
                largeNumberboard.pageView.scrollToPage(settings.boardPage, 0);
            }
        }
        if (settings.statsEnabled) {
            this.statsToggle.isChecked = settings.statsEnabled;
            if (this.statsToggle.isChecked) {
                this.requestStatistics();
            }
        }
        this.updateHeaderColor();
    }

    updateHeaderColor() {
        this.lotteryTypeItems.forEach((item) => item.updateLabelColor());
    }

    clearSetting() {
        GameUtils.clearGameSetting(this.gameId);
    }

    onCloseGameClick() {
        super.onCloseGameClick();
        this.clearSetting();
    }

    initHandlers() {
        super.initHandlers();
        this.timeHandler = new LotteryTimeHandler(this);
        this.logsHandler = new LotteryLogsHandler(this);
        this.finishHandler = new LotteryFinishHandler(this);
        this.betHandler = new LotteryBetHandler(this);
        this.statusHandler = new LotteryStatusHandler(this);
    }

    showWinningBet(bet: number) {
        const winningBet = GameUtils.addFlyingText(this.noticeNode, true, bet, 3, 0, 300);
        winningBet.name = "winningBet";
    }

    updateOddsFromConfigs() {
        if (this.gameConfigs.odds) {
            this.lotteryTypeItems.forEach((item, index) => {
                item.setOdds(this.gameConfigs.odds[LotteryHelper.getChoiceTypeKey(index)]);
            });
        }
    }

    updateSettingStorage() {
        const board = this.getCurrentBoard().getComponent(LotteryLargeNumberBoard);
        let page = 0;
        if (board) {
            page = board.pageView.getCurrentPageIndex();
        }
        const settings = {
            currentTypeIndex: this.currentTypeIndex,
            statsEnabled: this.statsToggle.isChecked,
            boardPage: page
        };
        GameUtils.setGameSetting(this.gameId, settings);
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.animatedTime.node.active = false;
        this.totalBet.string = "0";
        if (this.result) {
            this.result.node.active = false;
            this.result = null;
            this.extraResult = null;
        }
        this.clearHighlight();
        if (this.resultTween) {
            this.resultTween.stop();
            this.highlightLastResult();
            this.updateAfterResult();
            this.resultTween = null;
        }
        if (this.winningTween) {
            this.winningTween.stop();
            const winningBet = this.resultContainer.getChildByName("winningBet");
            winningBet.destroy();
            this.winningTween = null;
        }
    }

    showMiniWarning(data): cc.Node {
        if (this.resultTween) {
            return null;
        }
        AudioManager.getInstance().playClick();
        return super.showMiniWarning(data);
    }

    showProcessingWarning(show: boolean) {
        if (show) {
            AudioManager.getInstance().playClick();
        }
        super.showProcessingWarning(show);
    }

    showAcceptedBet(bet: number) {
        GameUtils.addFlyingText(this.noticeNode, false, bet, 1);
    }

    onChoiceBet(name: string) {
        this.expandableMenu?.collapseMenu();
        if (!this.isReadyBet()) {
            return;
        }

        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
        } else {
            this.lockBet();
            const betData = {
                betChoice: this.createBetChoice(this.currentTypeIndex, [name], this.currentBet),
                clientSentTime: new Date()
            };
            this.sendSocketData("bet", betData);
            const currentBoard = this.getCurrentBoard();
            currentBoard.resetBoard();
        }
    }

    onLotteryTypeChanged(toggle: cc.Toggle) {
        AudioManager.getInstance().playClick();
        const id = this.lotteryTypeItems.findIndex((item) => item.toggle === toggle);
        this.currentTypeIndex = id;
        this.showChoiceBoard(this.currentTypeIndex);
        this.expandableMenu?.collapseMenu();
        this.updateSettingStorage();
        this.updateHeaderColor();
        this.updateMiniRoundHistories();
    }

    getBoardIndex(index: number): number {
        let selectedIndex: number;
        switch (index) {
            case ChoiceType.Head:
            case ChoiceType.Tail:
                selectedIndex = 1;
                break;
            case ChoiceType.Set4:
            case ChoiceType.Set27:
            case ChoiceType.Special:
                // case ChoiceType.Parlay2:
                // case ChoiceType.Parlay3:
                // case ChoiceType.Parlay4:
                selectedIndex = 0;
                break;
            case ChoiceType.Others:
                selectedIndex = 2;
                break;
        }
        return selectedIndex;
    }

    showChoiceBoard(index: number) {
        const selectedIndex = this.getBoardIndex(index);
        const highlightData = this.getHighlightData();
        this.boards.forEach((board, i) => {
            const show = i === selectedIndex;
            board.node.active = true;
            board.node.opacity = show ? 255 : 0;
            board.node.y = show ? 0 : 10000;
            if (show) {
                board.resetBoard();
                board.resetScrolling();
                board.setHighlightResult(highlightData);
            }
        });
        this.updateDisplayOwnBets();
        this.updateDisplayStats();
    }

    createBetChoice(choiceType: number, selectedItems: string[], bet: number): any {
        const choices = [...selectedItems].sort((a, b) => parseInt(a) - parseInt(b));
        if (choiceType === ChoiceType.Others) {
            const order = { big: 0, small: 1, even: 2, odd: 3 };
            choices.sort((a, b) => order[a] - order[b]);
        }
        const key = LotteryHelper.getChoiceTypeKey(choiceType);
        const result = {};
        const subInfo = {};
        result[key] = subInfo;

        choices.forEach((item) => (subInfo[item] = bet));
        return result;
    }

    setSpecialNumbers(lastSpecial: string) {
        for (let i = 0; i < lastSpecial.length; i++) {
            const num = lastSpecial.charAt(i);
            this.lastSpecialNumbers[i].setValue(num);
        }
    }

    setLastRoundId(roundId: number) {
        this.lastRoundId.string = `#${roundId}`;
    }

    showResult(dataFinish: any): Promise<void> {
        const displayTime = this.displayResultTime;
        return new Promise((resolve) => {
            this.showResultDialog();
            this.resultTween = cc
                .tween(this.node)
                .call(async () => {
                    await this.setResult(dataFinish, true);
                    resolve();
                })
                .delay(displayTime)
                .call(() => {
                    this.hideResultDialog();
                    this.highlightLastResult();
                    this.updateAfterResult();
                    this.resultTween = null;
                })
                .start();
        });
    }

    updateAfterResult() {
        this.updateLastResult();
        this.updateMiniRoundHistories();
    }

    showLastSpecialResult(show: boolean) {
        this.lastRoundId.node.parent.active = show;
        this.lastSpecialNumbers[0].node.parent.active = show;
    }

    showResultDialog() {
        if (this.result) {
            return;
        }
        const node = cc.instantiate(this.resultPrefab);
        this.resultContainer.addChild(node);
        this.result = node.getComponent(LotteryResult);
        this.extraResult = node.getComponent(LotteryExtraResult);
    }

    async setResult(data: any, animated) {
        if (!this.result) {
            return;
        }
        this.result.setRoundId(data.roundId);
        await this.result.setData(data, animated, this.ownBets);
        this.extraResult.setData(this.calculateFinishNumberStatistics(data.settlementResult["27Sets"]));
    }

    calculateFinishNumberStatistics(data: string[]): string[] {
        const result = {};
        for (let i = 0; i < 10; i++) {
            const key = i.toString();
            const list = [];
            data.forEach((num) => {
                if (num.charAt(0) === key) {
                    const secondChar = num.charAt(1);
                    list.push(secondChar);
                }
            });

            list.sort((a, b) => +a - +b);
            result[key] = list.join(",");
        }
        return Object.values(result);
    }

    hideResultDialog() {
        if (!this.result) {
            return;
        }
        this.result.close();
        this.result = null;
        this.extraResult = null;
    }

    updateLastResult() {
        if (this.currentDataLogs.length === 0) {
            return;
        }
        this.showLastSpecialResult(true);
        const lastFinish = this.currentDataLogs[0];
        const result = lastFinish.result;
        const lastSpecial = result.special[0];
        this.setSpecialNumbers(lastSpecial);
        this.setLastRoundId(lastFinish.roundId);
    }

    highlightLastResult() {
        this.boards.forEach((board) => {
            board.showHighlight(true);
        });
        const currentBoard = this.getCurrentBoard();
        currentBoard.setHighlightResult(this.getHighlightData());
    }

    getCurrentBoard(): LotteryChoicesBoard {
        const boardIndex = this.getBoardIndex(this.currentTypeIndex);
        return this.boards[boardIndex];
    }

    clearHighlight() {
        this.boards.forEach((board) => board.clearHighlight());
    }

    getOwnBetsData(): any {
        const key = LotteryHelper.getChoiceTypeKey(this.currentTypeIndex);
        const data = this.ownBets[key];
        if (!data) {
            return {};
        }
        return data;
    }

    getHighlightData(): string[] {
        if (this.currentDataLogs.length === 0) {
            return [];
        }
        const lastData = this.currentDataLogs[0];
        switch (this.currentTypeIndex) {
            case ChoiceType.Set4:
                return lastData.settlementResult["4Sets"];
            case ChoiceType.Special:
                return [lastData.result.special[0].slice(-2)];
            case ChoiceType.Head:
                return [...lastData.settlementResult.head];
            case ChoiceType.Tail:
                return [...lastData.settlementResult.tail];
            case ChoiceType.Set27:
            case ChoiceType.Parlay2:
            case ChoiceType.Parlay3:
            case ChoiceType.Parlay4:
                return lastData.settlementResult["27Sets"];
            case ChoiceType.Others:
                const arr = [];
                const others = lastData.settlementResult.others;
                Object.keys(others).forEach((key) => {
                    if (others[key]) {
                        arr.push(key);
                    }
                });
                return arr;
        }
        return [];
    }

    onStatisticsToggleChanged(toggle: cc.Toggle) {
        AudioManager.getInstance().playClick();
        if (toggle.isChecked) {
            this.requestStatistics();
        } else {
            this.boards.forEach((board) => board.hideStatistics());
        }
        this.updateSettingStorage();
    }

    requestStatistics() {
        if (this.statsToggle.isChecked) {
            this.socket.emit("stats");
        }
    }

    normalShowNextDotCondition() {
        return (
            this.currentTimeRemaining < this.config.stopBetTime || this.currentTimeRemaining > this.config.fullTime - this.displayResultTime
        );
    }

    initMiniHistories() {
        this.miniRoundHistories.forEach((history) => history.init(this.needShowNextDot.bind(this)));
    }

    updateMiniRoundHistories() {
        if (this.currentDataLogs.length === 0) {
            return;
        }
        this.miniRoundHistories.forEach((history) => {
            if (history.node.activeInHierarchy) {
                history.setData(this.currentDataLogs);
            }
        });
    }

    updateDisplayOwnBets() {
        const currentBoard = this.getCurrentBoard();
        currentBoard.setOwnBet(this.getOwnBetsData());
    }

    placeChipOnBoard(bet: number, choiceType: string, choiceName: string, onComplete: () => void) {
        const currentType = LotteryHelper.getChoiceTypeKey(this.currentTypeIndex);
        if (currentType !== choiceType) {
            return;
        }
        const currentBoard = this.getCurrentBoard();
        const chipLocation = currentBoard.getChipLocation(choiceName);
        const chipFlyingDuration = 0.3;
        if (chipLocation) {
            const chipNode = this.betChips.createSmallChip(bet);
            const objectData = {
                chipNode: chipNode,
                bet: bet,
                destNode: chipLocation,
                startNode: null,
                onComplete: onComplete,
                delayDestroy: 0,
                duration: chipFlyingDuration,
                fadeDuration: 0.8
            };
            this.betChips.moveChipWithCallback(objectData);
        }
    }

    updateDisplayStats() {
        if (this.statsToggle.isChecked) {
            const board = this.getCurrentBoard();

            if (this.currentTypeIndex === ChoiceType.Others) {
                const dataOthers = this.stats["othersPercentage"];
                board.items.forEach((item) => {
                    item.setStats(dataOthers[item.node.name]);
                });
            } else {
                let choiceKey = "parlays";
                switch (this.currentTypeIndex) {
                    case ChoiceType.Set4:
                        choiceKey = "seventh";
                        break;
                    case ChoiceType.Special:
                        choiceKey = "special";
                        break;
                    case ChoiceType.Head:
                        choiceKey = "head";
                        break;
                    case ChoiceType.Tail:
                        choiceKey = "tail";
                        break;
                    default:
                        break;
                }
                const hotData = this.stats["hot"][choiceKey];
                const coldData = this.stats["cold"][choiceKey];
                board.items.forEach((item: LotteryNumberItem) => {
                    const name = item.node.name;
                    item.hideStatistics();
                    if (Object.keys(hotData).includes(name)) {
                        item.setState(false);
                        item.setStats(hotData[name]);
                    }
                    if (Object.keys(coldData).includes(name)) {
                        item.setState(true);
                        item.setStats(coldData[name]);
                    }
                });
            }
        }
    }

    openHistory() {
        AudioManager.getInstance().playClick();
        const node = cc.instantiate(this.historyPrefab);
        this.historyComponent = node.getComponent(LotteryHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.addDialog(node);
    }

    onResultClick() {
        AudioManager.getInstance().playClick();
        this.currentMiniPanel.openResultPage(this.gameId);
    }

    onIngameMenuInitialized(node: cc.Node) {
        super.onIngameMenuInitialized(node);
        if (this.inGameMenu) {
            this.expandableMenu = this.inGameMenu.expandableMenu;
        }
    }
}
