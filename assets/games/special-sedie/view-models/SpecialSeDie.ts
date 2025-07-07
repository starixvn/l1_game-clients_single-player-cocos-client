import SedieRoundHistory from "../../../common/round-history/sedie/SedieRoundHistory";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import { payChips } from "../../_base/action/PayChipsAction";
import BalancedBettingPoolGameBase from "../../_base/BalancedBettingPoolGameBase";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import SpecialSeDieBetHandler from "./handlers/SpecialSeDieBetHandler";
import SpecialSeDieFinishHandler from "./handlers/SpecialSeDieFinishHandler";
import SpecialSeDieLogsHandler from "./handlers/SpecialSeDieLogsHandler";
import SpecialSeDieTimeHandler from "./handlers/SpecialSeDieTimeHandler";
import SpecialSedieBetHistory from "./SpecialSedieBetHistory";
import { SpecialSeDieConfigs } from "./SpecialSeDieConfigs";
import SpecialSeDieHistory from "./SpecialSeDieHistory";
import SpecialSedieRoundHistory from "./SpecialSedieRoundHistory";

const { ccclass, property } = cc._decorator;

export const SpecialSedieId = 24;

@ccclass
export default class SpecialSeDie extends BalancedBettingPoolGameBase {
    @property(cc.Prefab)
    roundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    roundHistoryContainer: cc.Node = null;

    @property(cc.Prefab)
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryContainer: cc.Node = null;

    @property(cc.Animation)
    shakeThePlateAnimation: cc.Animation = null;

    @property(cc.Node)
    thePlate: cc.Node = null;

    @property({ type: cc.Sprite })
    dots: cc.Sprite[] = [];

    @property(cc.SpriteFrame)
    dotRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    dotWhite: cc.SpriteFrame = null;

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(cc.Label)
    selectedBetAmountLabelLeft: cc.Label = null;

    @property(cc.Label)
    selectedBetAmountLabelRight: cc.Label = null;

    @property(cc.Sprite)
    selectedBetAmountSpriteLeft: cc.Sprite = null;

    @property(cc.Sprite)
    selectedBetAmountSpriteRight: cc.Sprite = null;

    @property(cc.SpriteFrame)
    selectedBetAmountClickedImageLeft: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    selectedBetAmountUnClickedImageLeft: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    selectedBetAmountClickedImageRight: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    selectedBetAmountUnClickedImageRight: cc.SpriteFrame = null;

    @property(cc.Prefab)
    betHistoryPrefab: cc.Prefab = null;

    @property(cc.Label)
    betPercentageLeft: cc.Label = null;

    @property(cc.Label)
    betPercentageRight: cc.Label = null;

    @property(cc.Node)
    randomPosNode: cc.Node = null;
    override usingNewSettlement = true;
    private roundHistory: SedieRoundHistory = null;
    private miniRoundHistory: SpecialSedieRoundHistory;
    private betHistory: SpecialSedieBetHistory;
    private readonly choice = {
        odd: "odd",
        even: "even"
    };
    private showStats = true;

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = SpecialSedieId;
        this.setConfig(new SpecialSeDieConfigs());
    }

    onLoad() {
        super.onLoad();

        this.selectedBetAmountLabels = {
            [this.choice.even]: this.selectedBetAmountLabelLeft,
            [this.choice.odd]: this.selectedBetAmountLabelRight
        };
        this.selectedBetAmountSprites = {
            [this.choice.even]: this.selectedBetAmountSpriteLeft,
            [this.choice.odd]: this.selectedBetAmountSpriteRight
        };
        this.selectedBetAmountClickedImages = {
            [this.choice.even]: this.selectedBetAmountClickedImageLeft,
            [this.choice.odd]: this.selectedBetAmountClickedImageRight
        };
        this.selectedBetAmountUnClickedImages = {
            [this.choice.even]: this.selectedBetAmountUnClickedImageLeft,
            [this.choice.odd]: this.selectedBetAmountUnClickedImageRight
        };
        this.betPercentages = {
            [this.choice.even]: this.betPercentageLeft,
            [this.choice.odd]: this.betPercentageRight
        };

        this.initRoundHistory();
        this.animatedTime.setAnimatedY(30, -5);
    }

    onEnable() {
        super.onEnable();
        this.showStats = true;
        this.toggleStats(this.showStats);
    }

    onDestroy() {
        super.onDestroy();
        this.roundHistoryContainer.isValid && this.roundHistoryContainer.destroyAllChildren();
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

        this.timeHandler = new SpecialSeDieTimeHandler(this);
        this.logsHandler = new SpecialSeDieLogsHandler(this);
        this.finishHandler = new SpecialSeDieFinishHandler(this);
        this.betHandler = new SpecialSeDieBetHandler(this);
    }

    initRoundHistory() {
        const node = cc.instantiate(this.roundHistoryPrefab);
        this.roundHistory = node.getComponent(SedieRoundHistory);
        this.roundHistory.init(this);
        this.roundHistoryContainer.addChild(node);

        const mini = cc.instantiate(this.miniRoundHistoryPrefab);
        this.miniRoundHistory = mini.getComponent(SpecialSedieRoundHistory);
        this.miniRoundHistory.handleBetHistory = (roundId) => {
            this.openBetHistory(roundId);
        };
        this.miniRoundHistoryContainer.addChild(mini);
    }

    updateRoundHistory() {
        const miniHistoryData = this.currentDataLogs.map((log) => {
            let count = 0;
            const { result } = log;
            Object.keys(result).forEach((key) => {
                if (result[key]) {
                    count++;
                }
            });
            return {
                roundId: log.roundId || log.id || log.round,
                red: count
            };
        });
        this.roundHistory.setData(miniHistoryData.map((d) => d.red));
        this.miniRoundHistory.setData(miniHistoryData);
    }

    setDots(result) {
        const randomOption = this.randomPosNode.children[this.roundId % 5];

        Object.keys(result).forEach((key, index) => {
            this.dots[index].node.position = randomOption.children[index].position;
            this.dots[index].spriteFrame = result[key] ? this.dotRed : this.dotWhite;
        });
    }

    showResult() {
        if (this.currentDataLogs.length > 0) {
            const { settlementResult } = this.currentDataLogs[0];

            cc.tween(this.thePlate)
                .call(() => {
                    this.hideBalanceBetNotice();
                })
                .to(0.5, { position: cc.v2(50, 100) }, { easing: "sineInOut" })
                .call(() => {
                    this.updateRoundHistory();
                    this.betItems.forEach((betItem) => betItem.setHighlight(settlementResult[betItem.node.name.toLowerCase()], true));

                    const finish = this.finishHandler as GameBaseFinishHandler;
                    payChips(this, settlementResult, null, finish.payChipFlyTime, finish.WinningAnimationDuration);
                    this.finishShowResult = true;
                })
                .to(0.2, { opacity: 0 })
                .start();
        }
    }

    showWinningAnimation() {
        this.statusHandler.showStatusIfExist();
    }

    public highlightLastResult() {
        if (this.currentTimeRemaining <= this.config.stopBetTime) {
            return;
        }
        const dataLog = this.currentDataLogs[0];
        dataLog && this.highlightWonItems(dataLog.settlementResult, false);
    }

    private highlightWonItems(settlementResult: any, isAnimated = true) {
        this.betItems.forEach((betItem) => {
            betItem.setHighlight(settlementResult[betItem.node.name], isAnimated);
        });
    }

    public openHistory() {
        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(SpecialSeDieHistory);
        const historyComp = this.historyComponent as SpecialSeDieHistory;
        historyComp.gameId = this.gameId;
        historyComp.init(this.socket);
        historyComp.handleBetHistory = (roundId) => {
            this.openBetHistory(roundId);
        };
        this.currentMiniPanel.node.addChild(dialog);
    }

    public onBtnStatsClick() {
        this.showStats = !this.showStats;
        this.toggleStats(this.showStats);
    }

    public toggleStats(show: boolean) {
        this.roundHistoryContainer.active = show;
    }

    openBetHistory(roundId: number) {
        const node = cc.instantiate(this.betHistoryPrefab);
        this.betHistory = node.getComponent(SpecialSedieBetHistory);
        this.betHistory.init(this, roundId);
        this.currentMiniPanel.node.addChild(node);
        this.betHistory.gameId = this.gameId;
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.resetThePlatePosition();
    }

    resetThePlatePosition() {
        this.thePlate.position = cc.v2(0, 0);
        this.thePlate.opacity = 255;
        this.thePlate.active = true;
    }
}
