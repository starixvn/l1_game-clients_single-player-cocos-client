import AudioManager from "../../../common/audio/AudioManager";
import DraggableItem from "../../../common/draggable-layout/view-models/DraggableItem";
import GameUtils from "../../../common/GameUtils";
import { formatOdds } from "../../../common/helpers/NumberHelper";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import { payChips } from "../../_base/action/PayChipsAction";
import BalancedBettingPoolGameBase from "../../_base/BalancedBettingPoolGameBase";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import BalancedBettingPoolBetItem from "../../_base/view-models/BalancedBettingPoolBetItem";
import BitcoinMasterBetHistory from "./BitcoinMasterBetHistory";
import BitcoinMasterBettingPrice from "./BitcoinMasterBettingPrice";
import BitcoinMasterCandleTimer from "./BitcoinMasterCandleTimer";
import BitcoinMasterChart from "./BitcoinMasterChart";
import { BMBetType } from "./BitcoinMasterCommon";
import { BitcoinMasterConfigs } from "./BitcoinMasterConfigs";
import BitcoinMasterCurrentCandleValue from "./BitcoinMasterCurrentCandleValue";
import BitcoinMasterEvenOddMiniRoundHistory from "./BitcoinMasterEvenOddMiniRoundHistory";
import BitcoinMasterHistory from "./BitcoinMasterHistory";
import BitCoinMasterProgressBar from "./BitCoinMasterProgressBar";
import BitcoinMasterResult from "./BitcoinMasterResult";
import BitcoinMasterStatistic from "./BitcoinMasterStatistic";
import BitcoinMasterStatusDescription from "./BitcoinMasterStatusDescription";
import BitcoinMasterUpDownMiniRoundHistory from "./BitcoinMasterUpDownMiniRoundHistory";
import BitCoinMasterBetHandler from "./handlers/BitCoinMasterBetHandler";
import BitcoinMasterFinishHandler from "./handlers/BitCoinMasterFinishHandler";
import BitcoinMasterLogsHandler from "./handlers/BitCoinMasterLogsHandler";
import BitcoinMasterTimeHandler from "./handlers/BitCoinMasterTimeHandler";

const { ccclass, property } = cc._decorator;

export const BitcoinMasterId = 43;

@ccclass
export default class BitcoinMaster extends BalancedBettingPoolGameBase {
    @property(cc.Prefab)
    miniRoundHistoryUpDownPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryUpDownContainer: cc.Node = null;

    @property(cc.Prefab)
    miniRoundHistoryEvenOddPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryEvenOddContainer: cc.Node = null;

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(cc.Label)
    selectedUpBetAmountLabel: cc.Label = null;

    @property(cc.Sprite)
    selectedUpBetAmountSprite: cc.Sprite = null;

    @property(cc.Label)
    selectedDownBetAmountLabel: cc.Label = null;

    @property(cc.Sprite)
    selectedDownBetAmountSprite: cc.Sprite = null;

    @property(cc.Label)
    selectedEvenBetAmountLabel: cc.Label = null;

    @property(cc.Sprite)
    selectedEvenBetAmountSprite: cc.Sprite = null;

    @property(cc.Label)
    selectedOddBetAmountLabel: cc.Label = null;

    @property(cc.Sprite)
    selectedOddBetAmountSprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    selectedBetAmountClickedImage: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    selectedBetAmountUnClickedImage: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    disabledBetButtonImage: cc.SpriteFrame = null;

    @property(cc.Prefab)
    betHistoryPrefab: cc.Prefab = null;

    @property(cc.Label)
    upBetPercentage: cc.Label = null;

    @property(cc.Label)
    downBetPercentage: cc.Label = null;

    @property(cc.Label)
    evenBetPercentage: cc.Label = null;

    @property(cc.Label)
    oddBetPercentage: cc.Label = null;

    @property(BitcoinMasterResult)
    result: BitcoinMasterResult = null;

    @property(cc.Label)
    upDownOdds: cc.Label = null;

    @property(cc.Label)
    evenOddOdds: cc.Label = null;

    @property(cc.Prefab)
    statisticPrefab: cc.Prefab = null;

    @property(cc.Node)
    statisticNode: cc.Node = null;

    @property(BitcoinMasterChart)
    chartWebView: BitcoinMasterChart = null;

    @property(BitcoinMasterCurrentCandleValue)
    currentCandleValue: BitcoinMasterCurrentCandleValue = null;

    @property(BitcoinMasterCandleTimer)
    currentCandleTime: BitcoinMasterCandleTimer = null;

    @property(BitCoinMasterProgressBar)
    timeProgressBar: BitCoinMasterProgressBar = null;

    @property(BitcoinMasterStatusDescription)
    statusDesc: BitcoinMasterStatusDescription = null;

    @property(BitcoinMasterBettingPrice)
    bettingPrice: BitcoinMasterBettingPrice = null;

    @property(cc.Node)
    upDownTooltipNode: cc.Node = null;

    @property(cc.Node)
    evenOddTooltipNode: cc.Node = null;

    @property(DraggableItem)
    dragComp: DraggableItem = null;

    protected upDownMiniRoundHistory: BitcoinMasterUpDownMiniRoundHistory;
    protected evenOddMiniRoundHistory: BitcoinMasterEvenOddMiniRoundHistory;
    protected betHistory: BitcoinMasterBetHistory;
    protected isExistedStatistic = false;
    statistic: BitcoinMasterStatistic;
    readonly choices = ["up", "down", "even", "odd"];
    isPhone = false;

    override usingNewSettlement = true;

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = BitcoinMasterId;
        this.setConfig(new BitcoinMasterConfigs());
    }

    onLoad() {
        super.onLoad();
        this.setValueBetAmount();
        this.initRoundHistory();
        this.animatedTime.setAnimatedY(0, 0);
        this.animatedTime.setRedTime(-1);
        GameUtils.moveToOtherNode(this.upDownMiniRoundHistory.tip.node, this.upDownTooltipNode);
        GameUtils.moveToOtherNode(this.evenOddMiniRoundHistory.tip.node, this.evenOddTooltipNode);

        this.currentMiniPanel.chartsWebView[this.gameName] = this.chartWebView;
        this.currentMiniPanel.addNewLayerCallback(this.gameName, () => {
            if (this.isOpeningMiniGameAndDialog()) {
                this.hideChart();
            } else {
                this.showChart();
            }
        });

        this.statisticNode.on(cc.Node.EventType.CHILD_ADDED, this.showStatistic.bind(this));
        this.statisticNode.on(cc.Node.EventType.CHILD_REMOVED, this.hideStatistic.bind(this));

        const userAgent = window.navigator.userAgent.toLowerCase();
        this.isPhone = /android|iphone/.test(userAgent);

        uiManager.emitterListener(InternalEvents.SHOW_POPUP_MINI_GAMES, () => this.hideChart(), this);
        uiManager.emitterListener(
            InternalEvents.HIDE_POPUP_MINI_GAMES,
            () => {
                if (this.isOpeningMiniGameAndDialog()) {
                    return;
                }
                this.showChart();
            },
            this
        );
    }

    isOpeningMiniGameAndDialog(): boolean {
        const zIndex = this.node.getSiblingIndex();
        const aboverOtherNodes = this.currentMiniPanel.miniGames.children.filter(
            (child) => child.active && zIndex < child.getSiblingIndex()
        );

        return (
            aboverOtherNodes.length > 0 ||
            this.currentMiniPanel.noticeContainer.childrenCount > 0 ||
            this.currentMiniPanel.guideContainer.childrenCount > 0 ||
            this.currentMiniPanel.dialog.childrenCount > 0
        );
    }

    hideStatistic() {
        this.isExistedStatistic = false;
        if (this.currentMiniPanel.guideContainer.childrenCount === 0 && this.currentMiniPanel.dialog.childrenCount === 0) {
            this.showChart();
        }
    }

    showStatistic() {
        this.isExistedStatistic = true;
        this.hideChart();
    }

    hideChart() {
        this.chartWebView.hideWebView();
    }

    showChart() {
        this.node.active && this.chartWebView.showWebView();
        this.dragComp.onTouchEnd(null);
    }

    onEnable() {
        this.isPhone && this.currentMiniPanel.setIconOverMiniGame(false);
        super.onEnable();
        this.initChart();
        this.showChart();
    }

    onDisable() {
        super.onDisable();
        this.isPhone && this.currentMiniPanel.setIconOverMiniGame(true);
    }

    onDestroy() {
        this.currentMiniPanel.removeNewLayerCallback(this.gameName);
        this.currentMiniPanel.removeChartsWebView(this.gameName);

        super.onDestroy();
        this.miniRoundHistoryUpDownContainer.isValid && this.miniRoundHistoryUpDownContainer.destroyAllChildren();
        this.miniRoundHistoryEvenOddContainer.isValid && this.miniRoundHistoryEvenOddContainer.destroyAllChildren();
        uiManager.removeListenersWithTarget(this);
    }

    onData(data: any) {
        super.onData(data);
        if (data.close) {
            this.currentCandleValue.setData(data.open, data.close);
        }

        if (data.remainingTime && !data.um) {
            this.currentCandleTime.init(this);
            this.timeProgressBar.init(this);
        }

        if (data.round) {
            this.betHistory && this.betHistory.onData(data.round);
        }

        this.currentTimeRemaining === this.config.minBetTime - 3 ? this.bettingPrice.setData(data) : this.bettingPrice.setData(data, false);
    }

    initHandlers() {
        super.initHandlers();

        this.timeHandler = new BitcoinMasterTimeHandler(this);
        this.logsHandler = new BitcoinMasterLogsHandler(this);
        this.finishHandler = new BitcoinMasterFinishHandler(this);
        this.betHandler = new BitCoinMasterBetHandler(this);
    }

    dragMiniGame() {
        this.dragComp.touchCallback.start = (node) => {
            this.node.parent.insertChild(this.node, this.node.parent.childrenCount - 1);
        };
    }

    setValueBetAmount() {
        this.selectedBetAmountLabels = {
            [this.choices[0]]: this.selectedUpBetAmountLabel,
            [this.choices[1]]: this.selectedDownBetAmountLabel,
            [this.choices[2]]: this.selectedEvenBetAmountLabel,
            [this.choices[3]]: this.selectedOddBetAmountLabel
        };
        this.selectedBetAmountSprites = {
            [this.choices[0]]: this.selectedUpBetAmountSprite,
            [this.choices[1]]: this.selectedDownBetAmountSprite,
            [this.choices[2]]: this.selectedEvenBetAmountSprite,
            [this.choices[3]]: this.selectedOddBetAmountSprite
        };
        this.selectedBetAmountClickedImages = {
            [this.choices[0]]: this.selectedBetAmountClickedImage,
            [this.choices[1]]: this.selectedBetAmountClickedImage,
            [this.choices[2]]: this.selectedBetAmountClickedImage,
            [this.choices[3]]: this.selectedBetAmountClickedImage
        };
        this.selectedBetAmountUnClickedImages = {
            [this.choices[0]]: this.selectedBetAmountUnClickedImage,
            [this.choices[1]]: this.selectedBetAmountUnClickedImage,
            [this.choices[2]]: this.selectedBetAmountUnClickedImage,
            [this.choices[3]]: this.selectedBetAmountUnClickedImage
        };
        this.betPercentages = {
            [this.choices[0]]: this.upBetPercentage,
            [this.choices[1]]: this.downBetPercentage,
            [this.choices[2]]: this.evenBetPercentage,
            [this.choices[3]]: this.oddBetPercentage
        };
    }

    initRoundHistory() {
        const upDownMini = cc.instantiate(this.miniRoundHistoryUpDownPrefab);
        this.upDownMiniRoundHistory = upDownMini.getComponent(BitcoinMasterUpDownMiniRoundHistory);
        this.upDownMiniRoundHistory.handleBetHistory = (roundId, view) => {
            this.openBetHistory(roundId, view);
        };
        this.miniRoundHistoryUpDownContainer.addChild(upDownMini);

        const evenOddMini = cc.instantiate(this.miniRoundHistoryEvenOddPrefab);
        this.evenOddMiniRoundHistory = evenOddMini.getComponent(BitcoinMasterEvenOddMiniRoundHistory);
        this.evenOddMiniRoundHistory.handleBetHistory = (roundId, view) => {
            this.openBetHistory(roundId, view);
        };
        this.miniRoundHistoryEvenOddContainer.addChild(evenOddMini);
    }

    updateRoundHistory() {
        this.upDownMiniRoundHistory.setData(this.currentDataLogs);
        this.evenOddMiniRoundHistory.setData(this.currentDataLogs);
    }

    setResult(result: any) {
        this.result.setData(result);
    }

    showResult(animated: boolean) {
        if (this.currentDataLogs.length > 0) {
            const { settlementResult } = this.currentDataLogs[0];
            this.result.playAnimation(animated);
            if (animated) {
                this.statusHandler.showStatusIfExist();
                const finish = this.finishHandler as GameBaseFinishHandler;
                payChips(this, settlementResult, null, finish.payChipFlyTime, finish.WinningAnimationDuration);
                this.finishShowResult = true;
            }
        }
    }

    showWinningAnimation(data) {
        this.betItems.forEach((betItem) => {
            betItem.setHighlight(data.settlementResult[betItem.node.name], true);
        });
    }

    openGuide() {
        super.openGuide();
        this.closeStatistic();
    }

    public openHistory() {
        AudioManager.getInstance().playClick();
        const node = cc.instantiate(this.historyPrefab);
        this.historyComponent = node.getComponent(BitcoinMasterHistory);
        const historyComp = this.historyComponent as BitcoinMasterHistory;
        historyComp.init(this.socket);
        historyComp.handleBetHistory = (roundId, view) => {
            this.openBetHistory(roundId, view);
        };

        this.currentMiniPanel.addDialog(node);
        this.closeStatistic();
    }

    public onStatisChanged() {
        AudioManager.getInstance().playClick();
        if (!this.isExistedStatistic) {
            const node = cc.instantiate(this.statisticPrefab);
            this.statistic = node.getComponent(BitcoinMasterStatistic);
            const condition = () => {
                return this.currentTimeRemaining < this.config.stopBetTime || this.currentTimeRemaining > this.config.fullTime;
            };
            this.statistic.init(this);
            this.statistic.setData(this.currentDataLogs);
            this.statistic.logControl.init(condition);
            this.statisticNode.addChild(node);
        } else {
            this.statistic.dialog.closeDialog();
        }
    }

    closeStatistic() {
        if (this.isExistedStatistic) {
            this.statistic.dialog.closeDialog();
        }
    }

    openBetHistory(roundId: number, view) {
        AudioManager.getInstance().playClick();
        const node = cc.instantiate(this.betHistoryPrefab);
        this.betHistory = node.getComponent(BitcoinMasterBetHistory);
        this.currentMiniPanel.addDialog(node);
        this.betHistory.init(this, roundId);
        this.betHistory.gameId = this.gameId;
        this.betHistory.setDefaultView(view);
        this.closeStatistic();
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.betItems.forEach((betItem) => {
            betItem.ownBet.string = "0";
        });
        this.node.stopAllActions();
        this.enableBetButtons(true, this.selectedBetAmountUnClickedImage);
        this.bettingPrice.hideBettingPrice();
        this.result.hideResult();
    }

    public updateOddsFromConfigs() {
        if (this.gameConfigs.odds) {
            this.upDownOdds.string = formatOdds(this.gameConfigs.odds[this.choices[0]]);
            this.evenOddOdds.string = formatOdds(this.gameConfigs.odds[this.choices[2]]);
        }
    }

    initChart() {
        this.chartWebView.initURL(window.authData.ss);
        this.chartWebView.loadWebView();
    }

    closeGame() {
        this.statisticNode.isValid && this.statisticNode?.destroyAllChildren();
        this.chartWebView.isValid && this.chartWebView?.hideWebView();
        this.chartWebView.isValid && this.chartWebView?.destroyDivIframe();
        super.closeGame();
    }

    balanceBet(animated: boolean) {
        if (!animated) {
            this.setTotalBetAfterBalance();
            return;
        }

        const balancedBetAmount = this.getBalancedBetAmount();
        this.betItems.forEach((item) => {
            const itemComp = item as BalancedBettingPoolBetItem;
            if (item.node.name === BMBetType.Up || item.node.name === BMBetType.Down) {
                itemComp.balanceBet(GameUtils.getValueByCurrency(balancedBetAmount[0]));
            } else {
                itemComp.balanceBet(GameUtils.getValueByCurrency(balancedBetAmount[1]));
            }
        });
    }

    getBalancedBetAmount() {
        const totalBets = this.totalBets;
        const upDownBalancedBetAmount = Math.min(...[totalBets.up ?? 0, totalBets.down ?? 0]);
        const evenOddBalancedBetAmount = Math.min(...[totalBets.even ?? 0, totalBets.odd ?? 0]);

        return [upDownBalancedBetAmount, evenOddBalancedBetAmount];
    }

    setTotalBetAfterBalance() {
        const balancedBetAmount = this.getBalancedBetAmount();
        this.betItems.forEach((item) => {
            if (item.node.name === BMBetType.Up || item.node.name === BMBetType.Down) {
                item.setTotalBet(GameUtils.getValueByCurrency(balancedBetAmount[0]));
            } else {
                item.setTotalBet(GameUtils.getValueByCurrency(balancedBetAmount[1]));
            }
        });
    }

    enableBetButtons(enabled: boolean, image: cc.SpriteFrame) {
        const upButton = this.selectedUpBetAmountSprite.node.getComponent(cc.Button);
        const downButton = this.selectedDownBetAmountSprite.node.getComponent(cc.Button);
        const evenButton = this.selectedEvenBetAmountSprite.node.getComponent(cc.Button);
        const oddButton = this.selectedOddBetAmountSprite.node.getComponent(cc.Button);
        upButton.interactable = enabled;
        downButton.interactable = enabled;
        evenButton.interactable = enabled;
        oddButton.interactable = enabled;

        upButton.node.getChildByName("text").opacity = enabled ? 255 : 180;
        downButton.node.getChildByName("text").opacity = enabled ? 255 : 180;
        evenButton.node.getChildByName("text").opacity = enabled ? 255 : 180;
        oddButton.node.getChildByName("text").opacity = enabled ? 255 : 180;

        this.selectedUpBetAmountSprite.spriteFrame = image;
        this.selectedDownBetAmountSprite.spriteFrame = image;
        this.selectedEvenBetAmountSprite.spriteFrame = image;
        this.selectedOddBetAmountSprite.spriteFrame = image;
    }

    hideBetButtons() {
        if (!this.betBoardContainer.children[0].active) {
            this.enableBetButtons(false, this.disabledBetButtonImage);
        }
    }

    disableHistoryButton() {}

    disableGame() {
        super.disableGame();
        this.currentCandleTime.unschedule(this.currentCandleTime.setLifeTime);
        this.enableBetButtons(false, this.disabledBetButtonImage);
    }

    hideUmMessage() {
        super.hideUmMessage();
        if (this.currentTimeRemaining < this.config.betTime && this.currentTimeRemaining > this.config.stopBetTime) {
            this.enableBetButtons(true, this.selectedBetAmountUnClickedImage);
        }
    }
}
