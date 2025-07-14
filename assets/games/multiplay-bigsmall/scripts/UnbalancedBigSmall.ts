import { i18n } from "../../../ClientModules";
import AudioManager from "../../../common/audio/AudioManager";
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import { DishAnimation } from "../../bigsmall/view-models/BigSmall";
import { BigSmallConfigs } from "../../bigsmall/view-models/BigSmallConfigs";
import BigSmallDicesStatistic from "../../bigsmall/view-models/BigSmallDicesStatistic";
import BigSmallMiniRoundHistory from "../../bigsmall/view-models/BigSmallMiniRoundHistory";
import MultiplayGameSingle from "../../multiplay/scripts/MultiplayGameSingle";
import { handleBeginPlacingBet, handlePlacingBet, handleShakeDish } from "./actions/CustomActions";
import { tableGameColor, UnbalancedBigSmall1Id, unbalancedBigSmallConfigs } from "./UnbalancedBigSmallConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UnbalancedBigSmall extends MultiplayGameSingle {
    @property({ type: cc.Sprite })
    dices: cc.Sprite[] = [];

    @property({ type: cc.SpriteAtlas })
    diceAtlas: cc.SpriteAtlas = null;

    @property(cc.Node)
    thePlate: cc.Node = null;

    @property(cc.AudioSource)
    shakeDishAudio: cc.AudioSource = null;

    @property(cc.Animation)
    shakeThePlateAnimation: cc.Animation = null;

    @property(cc.Node)
    resultNode: cc.Node = null;

    @property(cc.Label)
    resultLabel: cc.Label = null;

    @property(cc.Node)
    bgTimer: cc.Node = null;

    protected scaleResultNode = 1;
    startRoundDuration = 2;
    config = new BigSmallConfigs();
    public statisticHistory: BigSmallDicesStatistic;

    override usingNewSettlement = true;

    constructor() {
        super();
        this.gameId = UnbalancedBigSmall1Id;
        this.groupDefaultGameId = UnbalancedBigSmall1Id;
    }

    onGameHide() {
        super.onGameHide();
        this.setBlurDishAndHideDices();
    }

    onGameShow() {
        super.onGameShow();
        this.setBlurDishAndHideDices();
    }

    setGameId(gameId: number) {
        this.gameId = gameId;
        this.config = unbalancedBigSmallConfigs[gameId];
        this.renderTableGame(gameId);
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.durations, Durations.Events.PLACING_BET, handlePlacingBet);
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_PLACING_BET, handleBeginPlacingBet);
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_STARTING_ROUND, handleShakeDish);
    }

    renderTableGame(gameId: number) {
        super.renderTableGame(gameId);
        if (this.tableGameBg) {
            this.gameId = gameId;
            this.tableGameBg.color = cc.Color.BLACK.fromHEX(tableGameColor[gameId]);
        }
    }

    setBgTimerVisibility(visible: boolean, animated = true) {
        if (!this.bgTimer) {
            return;
        }

        if (animated) {
            this.tween(this.bgTimer)
                .to(0.3, { opacity: visible ? 255 : 0 })
                .start();
        } else {
            this.bgTimer.opacity = visible ? 255 : 0;
        }
    }

    showSettlementResult(settlement: any) {
        this.setBgTimerVisibility(false);
        this.setDices(settlement.result, settlement.settlementResult);
        this.handleAnimResult();
    }

    handleAnimResult() {
        this.tween(this.thePlate)
            .call(() => {
                this.showDicesAndPlates();
                this.setBgTimerVisibility(false, false);
                this.shakeThePlateAnimation.playAdditive(DishAnimation.OpenDish);
            })
            .delay(this.showResultDuration)
            .call(() => {
                if (this.gameData?.settlement?.settlement) {
                    this.gameData.settlement.finishShowResult(this.gameData.settlement.settlement, true);
                }
            })
            .start();
    }

    handleAfterSettlementResult(settlement: any, animated: boolean) {
        if (!!settlement) {
            this.showWinChoiceAndUpdateHistory(settlement);
            this.highlightAndPayout(settlement);
            this.inSettlementSequence = false;
            if (!animated) {
                this.showDicesAndPlates();
                this.gameData.settlement.showStatus();
            }
        }
    }

    showWinChoiceAndUpdateHistory(settlement: any) {
        this.gameData.roundHistory.update();
        this.updateRoundHistory();
        this.showResultNode();
        this.gameData.resultHash.updateUI();
        if (settlement?.result && settlement?.settlementResult) {
            this.setDices(settlement.result, settlement.settlementResult);
        }
    }

    highlightAndPayout(settlement: any) {
        this.betItems.forEach((betItem) => betItem.setHighlight(settlement.settlementResult[betItem.node.name.toLowerCase()], true));
        this.thePlate.opacity = 0;
    }

    handleRoundHistory(roundHistory: any) {
        this.updateRoundHistory();
    }

    initMiniRoundHistory(node: cc.Node) {
        this.miniRoundHistory = node.getComponent(BigSmallMiniRoundHistory);
        this.miniRoundHistory.managedByParent = true;

        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.CHANGE, () => () => {
            this.miniRoundHistory.nextItemActive = false;
        });
        this.emitterListener(this.gameData.durations, Durations.Events.LOCKING_BET, () => () => {
            this.miniRoundHistory.nextItemActive = true;
        });
    }

    protected setDices(result, settlementResult) {
        const { dice1, dice2, dice3 } = result;
        const winChoice = Object.keys(settlementResult).find((choice) => settlementResult[choice]);
        const winChoiceString = i18n.t(`ui.choice_${winChoice}`);
        this.dices[0].spriteFrame = this.diceAtlas.getSpriteFrame(`${dice1}-goc-2`);
        this.dices[1].spriteFrame = this.diceAtlas.getSpriteFrame(`${dice2}-goc-1`);
        this.dices[2].spriteFrame = this.diceAtlas.getSpriteFrame(`${dice3}-goc-1`);
        this.resultLabel.string = `${dice1 + dice2 + dice3} - ` + winChoiceString.toUpperCase();
    }

    updateRoundHistory() {
        this.miniRoundHistory.setData(this.currentDataLogs);
        this.statisticHistory && this.statisticHistory.updateData(this.currentDataLogs);
    }

    setDicesVisibility(show: boolean) {
        this.dices.forEach((dice) => {
            dice.node.active = show;
        });
    }

    shakeThePlate() {
        this.showDicesAndPlates();
        this.shakeThePlateAnimation.playAdditive(DishAnimation.ShakeDish);
        this.tween(this.thePlate)
            .delay(0.2)
            .call(() => {
                this.setBgTimerVisibility(false, false);
                this.setDicesVisibility(false);
            })
            .delay(1)
            .call(() => {
                this.shakeDishAudio && AudioManager.getInstance().playSFX(this.shakeDishAudio.clip);
            })
            .delay(1)
            .call(() => {
                this.setBlurDishAndHideDices();
            })
            .start();
    }

    setBlurDishAndHideDices() {
        this.shakeThePlateAnimation.node.opacity = 25.5;
        this.setDicesVisibility(false);
    }

    showDicesAndPlates() {
        this.shakeThePlateAnimation.node.opacity = 255;
        this.setDicesVisibility(true);
    }

    protected showResultNode() {
        this.resultNode.active = true;
        this.tween(this.resultNode)
            .to(0.2, { scale: 1.2 }, { easing: "bounceOut" })
            .to(0.3, { scale: this.scaleResultNode, opacity: 255 })
            .start();
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.resetThePlate();
        this.disableResultNode();
    }

    disableResultNode() {
        this.resultNode.active = false;
        this.resultNode.opacity = 0;
    }

    resetThePlate() {
        this.thePlate.position = cc.v3(0, 0);
        this.thePlate.opacity = 255;
        this.thePlate.active = true;
    }

    highlightLastResult() {
        const dataLog = this.currentDataLogs[0];
        dataLog &&
            this.betItems.forEach((betItem) => {
                betItem.setHighlight(dataLog.settlementResult[betItem.node.name], false);
            });
    }

    initStatisticBoard(node: cc.Node) {
        AudioManager.getInstance().playClick();
        this.statisticHistory = node.getComponent(BigSmallDicesStatistic);
    }
}
