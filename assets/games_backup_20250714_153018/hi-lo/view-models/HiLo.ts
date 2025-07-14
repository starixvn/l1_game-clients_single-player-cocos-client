import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import { numberPad, numberWithCommas } from "../../../common/helpers/NumberHelper";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import NoIntervalTimeHandler from "../../_base/handlers/NoIntervalTimeHandler";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import NewMiniGameBase from "../../_new/_base/NewMiniGameBase";
import { handleGameState } from "../actions/HiLoBetAction";
import { updateClockTime } from "../actions/HiLoCountdownTimerAction";
import { handleStatusLost, handleStatusWon, updateCard, updateStakesAndButtons, updateStatistic } from "../actions/HiLoDealAction";
import { updateGameConfigs } from "../actions/HiLoGameConfigsAction";
import { updateRoundId } from "../actions/HiLoRoundCounterAction";
import HiLoBetHandler from "../events-handlers/HiLoBetHandler";
import HiLoConfigs from "../events-models/HiLoConfigs";
import HiLoGameConfigs from "../events-models/HiLoGameConfigs";
import HiLoGameData from "../events-models/HiLoGameData";
import { HiLoOwnBetsModel } from "../events-models/HiLoOwnBetsModel";
import { HiLoResultModel } from "../events-models/HiLoResultModel";
import { HiLoRoundCounter } from "../events-models/HiLoRoundCounter";
import { HiLoState } from "../events-models/HiLoState";
import { HiLoStateModel } from "../events-models/HiLoStateModel";
import { HiLoStatusModel } from "../events-models/HiLoStatusModel";
import HiLoBetBoard from "./HiLoBetBoard";
import HiLoBettingArea, { BettingAreaEvents } from "./HiLoBettingArea";
import HiLoResult from "./HiLoResult";
import HiLoStatistic from "./HiLoStatistic";

const { ccclass, property } = cc._decorator;

export const HiLoEvents = {
    bet: "bet",
    collect: "collect",
    deal: "deal"
};

export const HiLoId = 45;

@ccclass
export default class HiLo extends NewMiniGameBase {
    @property(HiLoBettingArea)
    bettingAreas: HiLoBettingArea[] = [];

    @property(cc.Node)
    betBoardContainer: cc.Node = null;

    @property(cc.Prefab)
    betBoardPrefab: cc.Prefab = null;

    @property(cc.Node)
    statisticArea: cc.Node = null;

    @property(cc.Prefab)
    statisticPrefab: cc.Prefab = null;

    @property(cc.Button)
    playButton: cc.Button = null;

    @property(cc.Button)
    collectButton: cc.Button = null;

    @property(cc.Label)
    betWin: cc.Label = null;

    @property(cc.Node)
    userLose: cc.Node = null;

    @property(HiLoResult)
    resultComp: HiLoResult = null;

    @property(cc.AudioClip)
    collectAudioClip: cc.AudioClip = null;

    gameData: HiLoGameData = null;
    isStopSchedule = false;
    readonly loseMessageEffectDuration = 1.5;
    readonly newRoundAfterLossDelayTime = 2.5;
    readonly winningEffectDuration = 1;
    readonly deductingAmountEffectDuration = 1;
    readonly spinCardsEffectDuration = 1;
    betBoardComp: HiLoBetBoard;
    statisticComp: HiLoStatistic;
    shouldHandleStatus = false;

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = HiLoId;
        this.setConfig(new HiLoConfigs());
    }

    onLoad() {
        this.gameData = new HiLoGameData(this);
        this.initTopArea();
        super.onLoad();
        this.registerOwnBetEvents();
        this.registerResultEvents();
        this.registerStatusEvents();
        this.registerRoundCounterEvents();
        this.registerBettingAreaEvents();
        this.registerDurationsEvents();
        this.registerStateEvents();
        this.registerGameConfigsEvents();
        this.initBetBoard();
        this.addCountdownTimerSchedule();
        this.animatedTime.setRedTime(10);
    }

    onEnable() {
        super.onEnable();
        this.isStopSchedule = false;

        if (this.gameData.stateModel.state === HiLoState.BLANK_NEW) {
            if (this.betBoardComp.chipValues && this.betBoardComp.chipValues[0]) {
                this.betBoardComp.setCurrentBet(this.betBoardComp.chipValues[0].toString());
            }
        }
        this.resultComp && this.resultComp.stopSpinCardAnimation();
    }

    onDisable() {
        super.onDisable();

        this.gameData.isProcessingBet = false;

        if (this.gameData) {
            this.gameData.durations.reset();
        }

        AudioManager.getInstance().stopAllSFX();
    }

    protected initHandlers() {
        super.initHandlers();
        this.statusHandler = null;
        this.timeHandler = new NoIntervalTimeHandler(this);
        this.betHandler = new HiLoBetHandler(this);
    }

    checkShowUmMessage(data: any) {
        return true;
    }

    private addCountdownTimerSchedule() {
        this.schedule(() => {
            !this.isStopSchedule && this.gameData.durations.countdown();
        }, 1);
    }

    private registerBettingAreaEvents() {
        this.bettingAreas.forEach((area) => {
            area.node.on(BettingAreaEvents.PLACING_BET, this.onPlacingBet, this);
        });
    }

    private registerResultEvents() {
        this.gameData.resultModel.on(HiLoResultModel.Events.CHANGE, (model) => {
            this.updateBasicData(model);
        });
    }

    private registerOwnBetEvents() {
        this.gameData.ownBetsModel.on(HiLoOwnBetsModel.Events.CHANGE, (model: HiLoOwnBetsModel) => {
            this.updateBasicData(model);
        });
    }

    private async updateBasicData(model: HiLoOwnBetsModel) {
        this.setInteractableButtons(false);
        await updateCard(this)(model);
        this.setInteractableButtons(true);
        updateStatistic(this)(model);
        updateStakesAndButtons(this)(model);
        if (!model.nextAmounts) {
            this.shouldHandleStatus = true;
            handleStatusLost(this)(this.gameData.statusModel);
        }

        if (this.betBoardComp) {
            const exist = this.betBoardComp.chipValues.includes(model.amount);
            if (exist) {
                this.betBoardComp.setSelectedIndexAndScroll(model.amount.toString());
            } else {
                this.betBoardComp.clearAllHighlight();
            }
        }
    }

    private registerStatusEvents() {
        this.gameData.statusModel.on(HiLoStatusModel.Events.WON, (statusModel) => {
            handleStatusWon(this)(statusModel);
        });

        this.gameData.statusModel.on(HiLoStatusModel.Events.LOST, (statusModel) => {
            handleStatusLost(this)(statusModel);
        });

        this.gameData.statusModel.on(HiLoStatusModel.Events.COLLECT_FAILED, () => {
            this.showProcessingWarning(false);
        });
    }

    private registerRoundCounterEvents() {
        this.gameData.roundCounter.on(HiLoRoundCounter.Events.CHANGE, updateRoundId(this.gameRound));
    }

    private registerDurationsEvents() {
        this.gameData.durations.on(Durations.Events.CHANGE_REMAINING_TIME, updateClockTime(this));
        this.gameData.durations.on(Durations.Events.TIMEOUT, () => {
            this.resetCountdownTimer();
        });
    }

    private registerStateEvents() {
        this.gameData.stateModel.on(HiLoStateModel.Events.CHANGE, handleGameState(this));
    }

    private registerGameConfigsEvents() {
        this.gameData.configs.on(HiLoGameConfigs.Events.CHANGE, updateGameConfigs(this));
    }

    onPlacingBet(betChoice: string) {
        this.playClick();
        this.emitEventConnection(HiLoEvents.deal, { betChoice: betChoice });
        this.resetCountdownTimer();
    }

    protected emitEventConnection(eventName, data) {
        if (!this.connection || !this.isReadyBet()) {
            return;
        }

        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
        } else {
            this.lockBet();
            this.connection.emit(eventName, data);
        }
    }

    initTopArea() {
        const node = cc.instantiate(this.statisticPrefab);
        this.statisticComp = node.getComponent(HiLoStatistic);
        this.statisticArea.addChild(node);
    }

    initBetBoard() {
        const betBoard = cc.instantiate(this.betBoardPrefab);
        this.betBoardComp = betBoard.getComponent(HiLoBetBoard);
        this.betBoardContainer.addChild(betBoard);
        this.betBoardComp.init((bet) => {
            this.onChangedBetChip(bet);
            if (bet && this.gameData.stateModel.state === HiLoState.BLANK_NEW) {
                this.betWin.string = numberWithCommas(bet.toString(), 2);
            }
        });
    }

    showPlayGameButton(status: boolean) {
        this.playButton.node.active = status;
    }

    onPlayClick() {
        this.playClick();
        this.gameRound.string = "";
        this.statisticComp.clearCards();
        this.emitEventConnection(HiLoEvents.bet, { amount: this.currentBet });
    }

    onCollectClick() {
        this.setInteractableButtons(false);
        this.resetCountdownTimer();
        this.emitEventConnection(HiLoEvents.collect, {});
    }

    enableAllBetOptions(status: boolean) {
        this.bettingAreas.forEach((area) => {
            area.enableBetChoice(status);
        });
    }

    resetStakesAndBetWin() {
        this.bettingAreas.forEach((area) => {
            area.resetStakeAmount();
        });
        this.betWin.string = numberWithCommas(this.currentBet, 2);
    }

    enableCollectButton(status: boolean) {
        this.collectButton && (this.collectButton.node.getChildByName("disabled-layer").active = !status);
    }

    setInteractableButtons(status: boolean) {
        this.collectButton && (this.collectButton.interactable = status);
        this.bettingAreas.forEach((area) => {
            area.node.getComponent(cc.Button).interactable = status;
        });
    }

    showUserLoseMessage(): Promise<void> {
        return new Promise((resolve) => {
            this.userLose.opacity = 0;
            this.userLose.scale = 0;
            const showMessageDuration = 0.3;
            const hideMessageDuration = 0.1;
            cc.tween(this.userLose)
                .to(showMessageDuration, { opacity: 255, scale: 1 }, { easing: "sineOut" })
                .delay(this.loseMessageEffectDuration)
                .call(() => {
                    resolve();
                    cc.tween(this.userLose).to(hideMessageDuration, { opacity: 0, scale: 0 }, { easing: "sineIn" }).start();
                })
                .start();
        });
    }

    async showWinningBet(bet: number) {
        const winningBet = GameUtils.addFlyingText(this.noticeNode, true, bet, this.winningEffectDuration, 0, 150);
        winningBet.name = "winningBet";

        return new Promise((resolve) => {
            cc.tween({}).delay(this.winningEffectDuration).call(resolve).start();
        });
    }

    showAcceptedBet(bet: number) {
        GameUtils.addFlyingText(this.noticeNode, false, bet, this.winningEffectDuration, 0, 150);
    }

    resetDataAndUI() {
        this.resetUIPrepareNewRound();
        this.statisticComp.clearCards();
    }

    resetUIPrepareNewRound() {
        if (this.animatedTime) {
            this.resetCountdownTimer();
        }
        this.enableAllBetOptions(false);
        this.enableCollectButton(false);
    }

    resetUIBlankNewState() {
        this.resetUIPrepareNewRound();
        this.showPlayGameButton(true);
        this.resultComp.faceDownCards();
        this.betBoardComp.disableBetBoard(false);
        this.gameRound.string = "";
        this.resetStakesAndBetWin();
        this.currentBet && this.betBoardComp.setCurrentBet(this.currentBet.toString());
    }

    resetCountdownTimer() {
        this.animatedTime.setTime(numberPad(this.config.betTime, 2));
        this.isStopSchedule = true;
    }
}
