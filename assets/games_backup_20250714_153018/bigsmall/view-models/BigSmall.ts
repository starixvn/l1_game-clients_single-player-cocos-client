import AudioManager from "../../../common/audio/AudioManager";
import ColorAssembler2D from "../../../common/ColorAssembler2D";
import { formatOdds } from "../../../common/helpers/NumberHelper";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import { payChips } from "../../_base/action/PayChipsAction";
import BalancedBettingPoolGameBase from "../../_base/BalancedBettingPoolGameBase";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import BigSmallBetHistory from "./BigSmallBetHistory";
import { BigSmallConfigs } from "./BigSmallConfigs";
import BigSmallDicesStatistic from "./BigSmallDicesStatistic";
import BigSmallHistory from "./BigSmallHistory";
import BigSmallMiniRoundHistory from "./BigSmallMiniRoundHistory";
import BigSmallBetHandler from "./handlers/BigSmallBetHandler";
import BigSmallFinishHandler from "./handlers/BigSmallFinishHandler";
import BigSmallLogsHandler from "./handlers/BigSmallLogsHandler";
import BigSmallTimeHandler from "./handlers/BigSmallTimeHandler";

const { ccclass, property } = cc._decorator;

export enum DishAnimation {
    OpenDish = "DishOpenAnimation",
    ShakeDish = "DishShakingAnimation"
}

export const BigSmallId = 1;

@ccclass
export default class BigSmall extends BalancedBettingPoolGameBase {
    @property(cc.Prefab)
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryContainer: cc.Node = null;

    @property(cc.Animation)
    shakeThePlateAnimation: cc.Animation = null;

    @property(cc.Node)
    diceContainer: cc.Node = null;

    @property({ type: cc.Sprite })
    dices: cc.Sprite[] = [];

    @property({ type: cc.SpriteAtlas })
    diceAtlas: cc.SpriteAtlas = null;

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(cc.Label)
    selectedBetAmountLabelLeft: cc.Label = null;

    @property(cc.Sprite)
    selectedBetAmountSpriteLeft: cc.Sprite = null;

    @property(cc.Label)
    selectedBetAmountLabelRight: cc.Label = null;

    @property(cc.Sprite)
    selectedBetAmountSpriteRight: cc.Sprite = null;

    @property(cc.SpriteFrame)
    selectedBetAmountClickedImage: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    selectedBetAmountUnClickedImage: cc.SpriteFrame = null;

    @property(cc.Prefab)
    betHistoryPrefab: cc.Prefab = null;

    @property(cc.Label)
    betPercentageLeft: cc.Label = null;

    @property(cc.Label)
    betPercentageRight: cc.Label = null;

    @property(cc.Node)
    resultNode: cc.Node = null;

    @property(cc.Label)
    resultLabel: cc.Label = null;

    @property(cc.Label)
    odds: cc.Label = null;

    @property(cc.Prefab)
    statisticPrefab: cc.Prefab = null;

    @property(cc.Node)
    positionStatistic: cc.Node = null;

    @property(cc.Node)
    thePlate: cc.Node = null;

    @property(cc.Node)
    bgTimer: cc.Node = null;

    @property(cc.AudioSource)
    shakeDishAudio: cc.AudioSource = null;

    @property(cc.Node)
    highlightOdds: cc.Node = null;

    protected miniRoundHistory: BigSmallMiniRoundHistory;
    protected betHistory: BigSmallBetHistory;
    statistic: BigSmallDicesStatistic;
    override usingNewSettlement = true;
    private showStatistic = true;
    public resultAnimating = false;
    private highlightOddsColor: ColorAssembler2D = null;

    Md5IsShowTooltip = false;
    Md5NodeWidth = 395;

    readonly choices = ["small", "big"];

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = BigSmallId;
        this.setConfig(new BigSmallConfigs());
    }

    onLoad() {
        super.onLoad();
        this.setValueBetAmount();
        this.initRoundHistory();
        this.initStatistic();
        this.highlightOddsColor = this.odds.node.getComponent(ColorAssembler2D);
    }

    onEnable() {
        super.onEnable();
        this.showStatistic = true;
        this.handleShowStatistic(this.showStatistic);
    }

    onDestroy() {
        super.onDestroy();
        this.miniRoundHistoryContainer.isValid && this.miniRoundHistoryContainer.destroyAllChildren();
    }

    onData(data: any) {
        super.onData(data);

        if (data.round) {
            this.betHistory && this.betHistory.onData(data.round);
        }
    }

    initHandlers() {
        super.initHandlers();

        this.timeHandler = new BigSmallTimeHandler(this);
        this.logsHandler = new BigSmallLogsHandler(this);
        this.finishHandler = new BigSmallFinishHandler(this);
        this.betHandler = new BigSmallBetHandler(this);
    }

    setValueBetAmount() {
        this.selectedBetAmountLabels = {
            [this.choices[0]]: this.selectedBetAmountLabelRight,
            [this.choices[1]]: this.selectedBetAmountLabelLeft
        };
        this.selectedBetAmountSprites = {
            [this.choices[0]]: this.selectedBetAmountSpriteRight,
            [this.choices[1]]: this.selectedBetAmountSpriteLeft
        };
        this.selectedBetAmountClickedImages = {
            [this.choices[0]]: this.selectedBetAmountClickedImage,
            [this.choices[1]]: this.selectedBetAmountClickedImage
        };
        this.selectedBetAmountUnClickedImages = {
            [this.choices[0]]: this.selectedBetAmountUnClickedImage,
            [this.choices[1]]: this.selectedBetAmountUnClickedImage
        };
        this.betPercentages = {
            [this.choices[0]]: this.betPercentageRight,
            [this.choices[1]]: this.betPercentageLeft
        };
    }

    initRoundHistory() {
        const mini = cc.instantiate(this.miniRoundHistoryPrefab);
        this.miniRoundHistory = mini.getComponent(BigSmallMiniRoundHistory);
        this.miniRoundHistory.handleBetHistory = (roundId) => {
            this.openBetHistory(roundId);
        };
        this.miniRoundHistoryContainer.addChild(mini);
    }

    updateRoundHistory() {
        this.miniRoundHistory.setData(this.currentDataLogs);
        this.statistic.init(this.currentDataLogs, this);
    }

    setDices(result) {
        const { dice1, dice2, dice3 } = result;
        this.dices[0].spriteFrame = this.diceAtlas.getSpriteFrame(`${dice1}-goc-2`);
        this.dices[1].spriteFrame = this.diceAtlas.getSpriteFrame(`${dice2}-goc-1`);
        this.dices[2].spriteFrame = this.diceAtlas.getSpriteFrame(`${dice3}-goc-1`);
        this.resultLabel.string = dice1 + dice2 + dice3;
    }

    showHideResult(show: boolean) {
        this.dices.forEach((dice) => {
            dice.node.active = show;
        });
    }

    showResult() {
        if (this.currentDataLogs.length > 0) {
            const { settlementResult } = this.currentDataLogs[0];

            cc.tween(this.thePlate)
                .call(() => {
                    this.hideBalanceBetNotice();
                    this.showHideResult(true);
                    this.shakeThePlateAnimation.playAdditive(DishAnimation.OpenDish);
                })
                .delay(1)
                .call(() => {
                    this.updateRoundHistory();
                    this.betItems.forEach((betItem) => betItem.setHighlight(settlementResult[betItem.node.name.toLowerCase()], true));
                    this.showWinningAnimation(this.currentDataLogs[0]);

                    const finish = this.finishHandler as GameBaseFinishHandler;
                    payChips(this, settlementResult, null, finish.payChipFlyTime, finish.WinningAnimationDuration);
                    this.finishShowResult = true;
                })
                .start();
        }
    }

    showWinningAnimation(data: any) {
        this.statusHandler.showStatusIfExist();
        this.resultNode.active = true;
        cc.tween(this.resultNode).to(0.2, { scale: 1.2 }, { easing: "bounceOut" }).to(0.3, { scale: 1, opacity: 255 }).start();
    }

    public openHistory() {
        AudioManager.getInstance().playClick();

        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(BigSmallHistory);
        const historyComp = this.historyComponent as BigSmallHistory;
        historyComp.gameId = this.gameId;
        historyComp.init(this.socket);
        historyComp.handleBetHistory = (roundId) => {
            this.openBetHistory(roundId);
        };
        this.currentMiniPanel.addDialog(dialog);
    }

    public initStatistic() {
        const node = cc.instantiate(this.statisticPrefab);
        this.statistic = node.getComponent(BigSmallDicesStatistic);
        this.positionStatistic.addChild(node);
    }

    public openStatistic() {
        this.showStatistic = !this.showStatistic;
        this.handleShowStatistic(this.showStatistic);
    }

    public handleShowStatistic(show: boolean) {
        this.positionStatistic.active = show;
    }

    openBetHistory(roundId: number) {
        AudioManager.getInstance().playClick();

        const node = cc.instantiate(this.betHistoryPrefab);
        this.betHistory = node.getComponent(BigSmallBetHistory);
        this.currentMiniPanel.addDialog(node);
        this.betHistory.init(this, roundId);
        this.betHistory.gameId = this.gameId;
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.resetThePlate();
        this.disableResultNode();
        this.betItems.forEach((betItem) => {
            betItem.ownBet.string = "0";
        });
        this.node.stopAllActions();
    }

    disableResultNode() {
        this.resultNode.active = false;
        this.resultNode.opacity = 0;
    }

    resetThePlate() {
        this.thePlate.position = cc.v3(0, 0, 0);
        this.thePlate.opacity = 255;
        this.thePlate.active = true;
    }
    public updateOddsFromConfigs() {
        if (this.gameConfigs.odds) {
            this.odds.string = formatOdds(this.gameConfigs.odds[this.choices[0]]);
        }
    }

    public applyPromotion(values) {
        this.odds.string = formatOdds(values[this.choices[0]]);
    }

    highLightBoostedOdds() {
        const color = cc.Color.WHITE;
        if (this.boostedChoices?.includes(this.choices[0])) {
            this.odds.node.color = color.fromHEX("#FA3A35");
            this.highlightOdds && this.enabledHighLightOdds(true);
        } else {
            this.odds.node.color = color;
            this.highlightOdds && this.enabledHighLightOdds(false);
        }
    }

    private enabledHighLightOdds(enabled: boolean) {
        this.highlightOdds.active = enabled;
        this.highlightOddsColor.enabled = enabled;
    }
}
