import GameUtils from "../../../common/GameUtils";
import MiniRoundHistory from "../../../common/mini-round-history/MiniRoundHistory";
import SedieRoundHistory from "../../../common/round-history/sedie/SedieRoundHistory";
import FreeBetGameBase from "../../_base/FreeBetGameBase";
import { Orientation } from "../../_base/Orientation";
import SedieBetHandler from "./handlers/SedieBetHandler";
import SedieFinishHandler from "./handlers/SedieFinishHandler";
import SedieLogsHandler from "./handlers/SedieLogsHandler";
import SedieTimeHandler from "./handlers/SedieTimeHandler";
import { SedieConfigs } from "./SedieConfigs";
import SedieHistory from "./SedieHistory";
import SedieTutorial from "./SedieTutorial";

const { ccclass, property } = cc._decorator;

export const SedieId = 2;

@ccclass
export default class Sedie extends FreeBetGameBase {
    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

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

    @property(cc.AudioSource)
    shakeThePlateAudio: cc.AudioSource = null;

    @property(cc.Node)
    thePlate: cc.Node = null;

    @property({ type: cc.Sprite })
    dots: cc.Sprite[] = [];

    @property(cc.SpriteFrame)
    dotRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    dotWhite: cc.SpriteFrame = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    @property(cc.Node)
    portraitGuideNode: cc.Node = null;

    @property(cc.Prefab)
    portraitGuide: cc.Prefab = null;

    private roundHistory: SedieRoundHistory;
    protected miniRoundHistory: MiniRoundHistory;
    openPlateDuration = 0.5;
    override usingNewSettlement = true;

    constructor() {
        super();
        this.internalInit();
    }

    protected internalInit() {
        this.gameId = SedieId;
        this.setConfig(new SedieConfigs());
        this.finishShowResult = false;
    }

    onLoad() {
        super.onLoad();
        this.initRoundHistory();

        this.animatedTime.setAnimatedY(30, -5);

        this.betItems.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });

        this.miniRoundHistory.tip.node.zIndex = 100;
        GameUtils.moveToOtherNode(this.miniRoundHistory.tip.node, this.ownBetContainer);
    }

    start() {
        if (GameUtils.isPhone() && this.orientation === Orientation.Landscape) {
            this.addTutorial("RotationGuide");
        }
    }

    hidePromotionOnPortrait() {
        if (!this.currentMiniPanel.boostedOdds) {
            return;
        }

        if (this.orientation === Orientation.Portrait) {
            this.currentMiniPanel.boostedOdds.node.active = false;
        }
    }

    onEnable() {
        super.onEnable();
        this.loading.active = true;
        if (this.orientation === Orientation.Portrait) {
            this.currentMiniPanel.miniMenu.active = false;
        }
        this.hidePromotionOnPortrait();
        if (GameUtils.isSafariIOSPhone() && this.orientation === Orientation.Portrait) {
            this.addTutorial("IOSPortraitGuide");
        }
    }

    protected initBetChips() {
        super.initBetChips();
        this.betChips.setNeedResetCurrentChip(false);
    }

    onData(data: any) {
        if (this.node.active) {
            super.onData(data);
        }
    }

    initHandlers() {
        super.initHandlers();

        this.logsHandler = new SedieLogsHandler(this);
        this.timeHandler = new SedieTimeHandler(this);
        this.finishHandler = new SedieFinishHandler(this);
        this.betHandler = new SedieBetHandler(this);
    }

    normalShowNextDotCondition() {
        return this.currentTimeRemaining < this.config.stopBetTime || this.currentTimeRemaining > this.config.fullTime;
    }

    initRoundHistory() {
        const node = cc.instantiate(this.roundHistoryPrefab);
        this.roundHistory = node.getComponent(SedieRoundHistory);
        this.roundHistory.logControl.init(this.needShowNextDot.bind(this));
        this.roundHistoryContainer.addChild(node);

        const mini = cc.instantiate(this.miniRoundHistoryPrefab);
        this.miniRoundHistory = mini.getComponent(MiniRoundHistory);
        this.miniRoundHistory.init(this.needShowNextDot.bind(this));
        this.miniRoundHistoryContainer.addChild(mini);
    }

    updateRoundHistory() {
        const miniHistoryData = this.currentDataLogs.map((d) => {
            let count = 0;
            const list = ["red1", "red2", "red3", "red4"];
            list.forEach((i) => {
                if (d.result[i]) {
                    count++;
                }
            });
            return {
                roundId: d.roundId || d.id || d.round,
                red: count
            };
        });

        this.roundHistory.setData(miniHistoryData.map((d) => d.red));
        this.miniRoundHistory.setData(miniHistoryData);
    }

    openHistory() {
        this.playClick();
        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(SedieHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.addDialog(dialog);
    }

    showHideResult(show: boolean) {
        this.dots.forEach((dot) => {
            dot.node.active = show;
        });
    }

    setDots(result) {
        Object.keys(result).forEach((key, index) => {
            this.dots[index].spriteFrame = result[key] ? this.dotRed : this.dotWhite;
        });
    }

    showResult() {
        if (this.currentDataLogs.length > 0) {
            const { result, settlementResult } = this.currentDataLogs[0];
            this.setDots(result);
            this.betItems.forEach((betItem) => betItem.setHighlight(settlementResult[betItem.node.name.toLowerCase()], true));
        }
    }

    openPlate(animated: boolean) {
        this.showHideResult(true);

        const platePos = cc.v2(50, 100);
        if (animated) {
            cc.tween(this.thePlate)
                .to(this.openPlateDuration, { position: platePos }, { easing: "sineInOut" })
                .to(0.2, { opacity: 0 })
                .start();
        } else {
            this.thePlate.position = cc.v3(platePos);
            this.thePlate.opacity = 0;
        }
    }

    closePlate(animated = true) {
        if (animated) {
            const platePos = cc.v2(50, 100);
            this.thePlate.position = cc.v3(platePos);
            cc.tween(this.thePlate)
                .to(0, { opacity: 255 })
                .to(0.5, { position: cc.v2(0, 0) })
                .start();
        } else {
            this.thePlate.opacity = 255;
            this.thePlate.position = cc.v3(0, 0);
        }
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.node.stopAllActions();
        this.thePlate && this.thePlate.stopAllActions();
        this.closePlate(false);
        this.shakeThePlateAnimation.stop();
        this.chipContainer.children.forEach((child) => child.destroyAllChildren());
        this.needHideNextDotRoundHistory = false;
    }

    highlightLastResult() {
        if (this.currentTimeRemaining <= this.config.stopBetTime) {
            return;
        }
        const dataLog = this.currentDataLogs[0];
        dataLog && this.highlightWonItems(dataLog.settlementResult, false);
    }

    highlightWonItems(settlementResult: any, isAnimated = true) {
        this.betItems.forEach((betItem) => {
            betItem.setHighlight(settlementResult[betItem.node.name], isAnimated);
        });
    }

    addTutorial(componentName) {
        if (!this.portraitGuideNode || !this.portraitGuide) {
            return;
        }

        this.portraitGuideNode.destroyAllChildren();
        const guideNode = cc.instantiate(this.portraitGuide);
        const tutorialComp: SedieTutorial = guideNode.getComponent(componentName);
        const data = tutorialComp.getLocalStorageData();
        if (!data.enabled) {
            return;
        }

        this.portraitGuideNode.addChild(guideNode);
        tutorialComp.dontShowAgainCallback = (dontShow: boolean) => {
            data.enabled = !dontShow;
            tutorialComp.setLocalStorageData(data);
        };
    }

    showWinningBet(bet: number) {
        let winningBet;
        if (this.orientation === Orientation.Landscape) {
            winningBet = GameUtils.addFlyingText(this.userProfile.userAvatar.node.parent, true, bet, this.WinningAnimationDuration, 80, 10);
        } else {
            winningBet = GameUtils.addFlyingText(this.userProfile.userBalance.node, true, bet, this.WinningAnimationDuration, 20, 40);
        }

        winningBet.name = "winningBet";
    }

    showAcceptedBet(bet: number) {
        if (this.orientation === Orientation.Landscape) {
            GameUtils.addFlyingText(this.userProfile.userAvatar.node.parent, false, bet, 1, 80);
        } else {
            GameUtils.addFlyingText(this.userProfile.userBalance.node, false, bet, 1, 40);
        }
    }
}
