import AudioManager from "../../../common/audio/AudioManager";
import MiniRoundHistory from "../../../common/mini-round-history/MiniRoundHistory";
import NewCard from "../../../common/new-card/view-models/NewCard";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import DragonTigerUtil from "./DragonTigerUtil";
import RHFinishDataHandler from "./handlers/RHFinishDataHandler";
import RHGameTimeHandler from "./handlers/RHGameTimeHandler";
import RHLogsDataHandler from "./handlers/RHLogsDataHandler";
import RongHoHistory from "./history/RongHoHistory";
import RHRoundResultItem from "./RHRoundResultItem";
import { RongHoConfigs } from "./RongHoConfigs";

const { ccclass, property } = cc._decorator;

export const RongHoId = 7;

@ccclass
export default class RongHo extends SocketIOMiniGameBase {
    @property(cc.Animation)
    resultAnimation: cc.Animation = null;

    @property(cc.Animation)
    drawAnimation: cc.Animation = null;

    @property(cc.Node)
    resultFrame: cc.Node = null;

    @property(cc.Label)
    dragonStats: cc.Label = null;

    @property(cc.Label)
    tigerStats: cc.Label = null;

    @property(cc.Label)
    drawStats: cc.Label = null;

    @property({ type: cc.Node })
    frontCardNodes: cc.Node[] = [];

    @property({ type: cc.Sprite })
    cardBacks: cc.Sprite[] = [];

    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    @property(MiniRoundHistory)
    miniRoundHistory: MiniRoundHistory = null;

    @property(cc.Node)
    scoreBoard: cc.Node = null;

    @property(cc.AudioSource)
    audioDrawCard: cc.AudioSource = null;

    public resultCards = [];
    private frontCards: NewCard[] = [];
    public resultAnimating = false;
    override usingNewSettlement = true;

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = RongHoId;
        this.setConfig(new RongHoConfigs());
    }

    protected onChangedBetChip(bet) {
        super.onChangedBetChip(bet);
    }

    public pressedHistoryDialog() {
        AudioManager.getInstance().playClick();

        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(RongHoHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.addDialog(dialog);
    }

    public pressedShowScoreBoard() {
        AudioManager.getInstance().playClick();
        this.scoreBoard.active = !this.scoreBoard.active;
    }

    onLoad() {
        super.onLoad();
        const condition = () => {
            return (
                this.currentTimeRemaining < this.config.stopBetTime ||
                this.currentTimeRemaining > this.config.fullTime - this.resultAnimation.defaultClip.duration
            );
        };
        this.logControl.init(condition);
        this.frontCards = this.frontCardNodes.map((card) => card.children[0].getComponent(NewCard));
    }

    onEnable() {
        super.onEnable();
        this.cardBacks.forEach((back) => (back.node.scale = 1));
        this.scoreBoard.active = this.currentDataLogs.length > 0;
        this.resultAnimation.on("finished", () => {
            this.finishShowResult = true;
            this.statusHandler.showStatusIfExist();
            this.showResult(true);
        });
    }

    onDisable() {
        super.onDisable();
        this.resultAnimation.stop();
        this.drawAnimation.stop();
        this.resultAnimation.off("finished");
    }

    protected initHandlers() {
        super.initHandlers();

        this.logsHandler = new RHLogsDataHandler(this);
        this.finishHandler = new RHFinishDataHandler(this);
        this.timeHandler = new RHGameTimeHandler(this);
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.resultFrame.active = false;
        this.cardBacks.forEach((back) => (back.node.scale = 1));
        this.drawAnimation.stop();
        this.resultAnimation.stop();
        this.node.stopAllActions();
    }

    private showResultCards(show: boolean) {
        if (this.resultCards.length !== 2 && show) {
            return;
        }

        if (show) {
            this.resultCards.forEach((data, index) => {
                const card = this.frontCardNodes[index];
                card.active = true;
                card.scaleX = 1;
                this.frontCards[index].setCardOldStyle({
                    rank: data.card.toString(),
                    suit: data.type
                });
                this.frontCards[index].faceUp();
            });
        } else {
            this.frontCardNodes.forEach((card, index) => {
                card.scaleX = 0;
                this.frontCards[index].faceDown();
            });
        }
    }

    private updateResultCards() {
        if (this.resultCards.length !== 2) {
            return;
        }

        this.resultCards.forEach((data, index) => {
            this.frontCards[index].setCardOldStyle({
                rank: data.card.toString(),
                suit: data.type
            });
            this.frontCards[index].faceUp();
        });
    }

    private highlightWonItem(highlight: boolean, winItem = "") {
        if (highlight) {
            if (winItem !== "") {
                this.betItems.forEach((item) => {
                    item.setHighlight(item.node.name === winItem);
                });
            }
        } else {
            this.betItems.forEach((item) => item.resetHighlight());
        }
    }

    public updateLogs() {
        //update display logs
        let dragonCount = 0,
            drawCount = 0;

        const logControlData = [];
        const result = [];
        this.currentDataLogs.forEach((log) => {
            const settlementResult = log.settlementResult;
            const winItem = DragonTigerUtil.getWinItem(settlementResult);
            result.push(winItem);
            switch (winItem) {
                case 0:
                    dragonCount++;
                    break;
                case 2:
                    drawCount++;
                    break;
            }
        });

        let count = 0;
        for (let i = 0; i < result.length; ) {
            if (result[i] === 2) {
                //draw
                count++;
                if (i === result.length - 1) {
                    // show special last item
                    logControlData.push({ item: 2, draw: count });
                }
            } else {
                logControlData.push({
                    item: result[i],
                    draw: count
                });
                count = 0;
            }
            i++;
        }
        this.miniRoundHistory.setData(this.currentDataLogs);

        logControlData.reverse();
        this.logControl.setData(logControlData.map((d) => d.item));
        const items = this.logControl.content.getComponentsInChildren(RHRoundResultItem);
        items.forEach((item, index) => item.setValue(logControlData[index].draw));

        const dragonStats = Math.floor((dragonCount * 100) / this.currentDataLogs.length);
        const drawStats = Math.floor((drawCount * 100) / this.currentDataLogs.length);
        const tigerStats = 100 - (dragonStats + drawStats);

        this.dragonStats.string = `${dragonStats}%`;
        this.tigerStats.string = `${tigerStats}%`;
        this.drawStats.string = `${drawStats}%`;
    }

    public showResult(show: boolean) {
        if (show) {
            this.updateLogs();
            this.showResultCards(true);

            const betChoice = ["dragon", "tiger", "tie"];
            const choiceWin = DragonTigerUtil.getWinItem(this.currentDataLogs[0].settlementResult);
            const winItem = betChoice[choiceWin];
            if (winItem !== "") {
                this.gameAudios.playShowResultAudio();
                this.resultFrame.active = true;
                this.resultFrame.children.forEach((child) => (child.active = child.name === winItem));
                this.highlightWonItem(true, winItem);
            }
        } else {
            this.showResultCards(false);
            this.highlightWonItem(false);
            this.resultFrame.active = false;
        }
    }

    public playAnimationResult() {
        this.animatedTime.node.active = false;
        this.updateResultCards();
        this.resultAnimation.play();
        this.resultAnimating = true;
    }

    public playDrawAnimation() {
        this.showResult(false);
        this.drawAnimation.play();
        this.audioDrawCard.setCurrentTime(0.2);
        AudioManager.getInstance().playSFX(this.audioDrawCard.clip);
        cc.tween(this.node)
            .delay(0.2)
            .call(() => {
                this.audioDrawCard.stop();
                this.audioDrawCard.setCurrentTime(0.2);
                AudioManager.getInstance().playSFX(this.audioDrawCard.clip);
            })
            .delay(0.2)
            .call(() => {
                this.audioDrawCard.stop();
            })
            .start();
    }
}
