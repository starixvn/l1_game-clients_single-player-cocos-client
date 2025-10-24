import NewGameData from "../_base_new/models/NewGameData";
import StandAloneTableGameBase from "../_base_new/view-models/StandAloneTableGameBase";
import { ChoiceBet, SoloBetModel, SoloBetState } from "./solo-bet-model";
import SoloGameData from "./solo-game-data";
import { Durations } from "../_new/_base/game-data-management/models/durations";
import AutoRebetDialog from "../../common/auto-rebet-dialog/AutoRebetDialog";
import GameUtils from "../../common/GameUtils";
import CloseGameDialog from "../../common/close-game-dialog/CloseGameDialog";
import CommonDialog from "../../common/_base/view-models/CommonDialog";
import { WEBVIEW_ACTION } from "../../constants";
import { userManager } from "../../common/user/UserManager";
import { i18n } from "../../ClientModules";
import { CommonEvents } from "../_new/_base/game-data-management/models/common-events";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SoloGame extends StandAloneTableGameBase {
    @property(cc.Button)
    btnSpin: cc.Button = null;

    @property(cc.Button)
    btnAutoRebet: cc.Button = null;

    @property(cc.Node)
    nodeStopAutoRebet: cc.Node = null;

    @property(cc.Prefab)
    autoRebetDialogPrefab: cc.Prefab = null;

    @property(cc.Label)
    lblAutoRebetCount: cc.Label = null;

    @property(cc.Prefab)
    closeGameDialogPrefab: cc.Prefab = null;

    protected isStartRound = false;

    betWinAmount = 0;
    autoRebetCount = 0;

    private pendingBetChoice: string = null;
    private pendingBetAmount = 0;
    private isWaitingForBetResponse = false;
    protected isStopAutoRebetMode = false;
    private isCloseGameDialogOpen = false;
    private isAutoRebetMessageVisible = false;

    onLoad() {
        super.onLoad();
        this.animatedTime.setAnimatedY(20, -10);
        this.hideAutoRebetMessage();
        this.resetAutoRebetCount();
        this.listenMessageFromParent();
    }
    get soloBetModel() {
        return this.gameData.betModel as SoloBetModel;
    }

    onGameHide(): void {
        this.isGameHide = true;
        const step = () => {
            cc.game.step();
            setTimeout(step, 100);
        };
        setTimeout(step, 100);
        cc.game.resume();
    }

    onGameShow(): void {
        this.isGameHide = false;
    }

    setGameRound(gameRoundId) {
        const gameRound = this.formatGameRound(gameRoundId);
        this.gameRound.string = gameRound;
        this.gameRound.node.parent.active = gameRoundId > 0;
    }

    createGameData(): NewGameData {
        return new SoloGameData();
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CONFIRM_BET, () => () => this.onConfirmBet());

        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.PLACE_BET_FAILED, () => () => {
            this.soloBetModel.changeState(SoloBetState.BETTING_FAILED);
            this.handleBetResponse(false);
        });

        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.PLACE_BET_SUCCESS, () => () => {
            this.handleBetResponse(true);
        });

        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CHANGE_STATE, () => (state) => {
            this.onStateChange(state);
        });

        this.emitterListener(this.gameData.durations, Durations.Events.CHANGE_REMAINING_TIME, () => ({ remaining }) => {
            const state = this.soloBetModel.state;
            if (remaining === 0 && state !== SoloBetState.RESULT) {
                this.soloBetModel.confirmBet();
            }
        });

        this.emitterListener(this.gameData, CommonEvents.API_ERROR, () => (apiError) => {
            if (this.isAutoRebetMode()) {
                this.resetAutoRebetCount();
                this.hideAutoRebetMessage();
            }
        });

        this.onStateChange(this.soloBetModel.state);
    }

    private handleBetResponse(isSuccess: boolean) {
        if (!this.isWaitingForBetResponse) {
            return;
        }

        this.isWaitingForBetResponse = false;

        if (isSuccess) {
            this.continueAfterBetSuccess();
        } else {
            this.showProcessingWarning(false);
        }

        this.pendingBetChoice = null;
        this.pendingBetAmount = 0;
    }

    private continueAfterBetSuccess() {
        const choice = this.pendingBetChoice;
        const amount = this.pendingBetAmount;

        if (!choice || !amount) {
            return;
        }

        this.showProcessingWarning(false);

        !this.isStartRound && this.soloBetModel.changeState(SoloBetState.STARTING_ROUND);
        this.isStartRound = true;
    }

    onStateChange(state: string) {
        // override
    }

    updateSpinButtonInteractable() {
        const state = this.soloBetModel.state;
        const isStateCanBet =
            state === SoloBetState.BETTING_FAILED || state === SoloBetState.STARTING_ROUND || state === SoloBetState.READY;
        this.btnSpin.interactable = this.soloBetModel.existBet() && isStateCanBet && !this.isAutoRebetMode();
    }

    onConfirmBet() {
        this.sendSocketData("settle", null);
    }

    onReBet(bet: any, autoRebetCount?: number) {
        if (autoRebetCount !== undefined) {
            this.autoRebetCount = autoRebetCount;
        }

        const lastBestAmount = this.calculateLastBets(this.soloBetModel.lastQueueBet);
        const isBalanceEnough = this.checkAvailableBalance(lastBestAmount);
        if (!isBalanceEnough) {
            this.clickStopAutoRebet();
            return;
        }

        this.handleRebetWhenAvailableBalance(bet);
    }

    private handleRebetWhenAvailableBalance(bet: any) {
        this.setAutoRebetInteractable(false);

        if (this.autoRebetCount > 0) {
            this.updateAutoRebetCount();
            if (!this.isAutoRebetMessageVisible) {
                this.showAutoRebetMessage();
                this.isAutoRebetMessageVisible = true;
            }
            this.setStopAutoRebetVisible(true);
        } else {
            this.hideAutoRebetMessage();
            this.isAutoRebetMessageVisible = false;
        }

        const betData = this.createBetData(bet);
        this.sendSocketData("rebet", betData);
    }

    onPlaceBet(bet: any) {
        const betData = this.createBetData(bet);
        this.sendSocketData("bet", betData);
    }

    protected createBetData(bet: any) {
        throw new Error("Method not implemented.");
    }

    clickConfirmBet() {
        this.gameData.durations.remaining = 0;
    }

    clickAutoRebet() {
        this.playClick();

        const hasEnoughBalanceForAutoRebet = this.checkBalanceWhenStartAutoRebet();
        if (!hasEnoughBalanceForAutoRebet) {
            return;
        }

        const dialog = cc.instantiate(this.autoRebetDialogPrefab);
        const comp = dialog.getComponent(AutoRebetDialog);
        this.currentMiniPanel.node.addChild(dialog);

        comp.onConfirmCallback = (autoRebetCount: number) => {
            const betObject = this.convertBetQueueToBetObject(this.soloBetModel.lastQueueBet);
            this.onReBet(betObject, autoRebetCount - 1);
        };
    }

    checkBalanceWhenStartAutoRebet(): boolean {
        const lastBestAmount = this.calculateLastBets(this.soloBetModel.lastQueueBet);
        const isBalanceEnough = this.checkAvailableBalance(lastBestAmount);
        this.setAutoRebetInteractable(isBalanceEnough);
        return isBalanceEnough;
    }

    clickStopAutoRebet() {
        this.isStopAutoRebetMode = true;
        this.hideAutoRebetMessage();
        this.isAutoRebetMessageVisible = false;
    }

    convertBetQueueToBetObject(bets: ChoiceBet[]): { [choice: string]: number } {
        const consolidated = {};
        bets.forEach((bet) => {
            const currentBet = consolidated[bet.choice] ?? 0;
            consolidated[bet.choice] = currentBet + bet.amount;
        });
        return consolidated;
    }

    updateAutoRebetCount() {
        const autoRebetCount = this.autoRebetCount;
        const autoRebetCountString = i18n.t("MiniRoulette.remaining_rounds", { x: autoRebetCount });
        this.lblAutoRebetCount.string = autoRebetCountString;
    }

    resetAutoRebetCount() {
        this.autoRebetCount = 0;
        this.setAutoRebetInteractable(false);
        this.isAutoRebetMessageVisible = false;
    }

    setAutoRebetInteractable(isInteractable: boolean) {
        this.btnAutoRebet.interactable = isInteractable;
    }

    setStopAutoRebetVisible(isVisible: boolean) {
        this.nodeStopAutoRebet.active = isVisible;
    }

    showAutoRebetMessage() {
        this.setStopAutoRebetVisible(true);

        const autoRebetMessage = this.lblAutoRebetCount.node.parent;
        autoRebetMessage.active = true;
        autoRebetMessage.scale = 0;
        autoRebetMessage.opacity = 0;

        cc.tween(autoRebetMessage).to(0.5, { scale: 1, opacity: 255 }, { easing: cc.easing.backOut }).start();
    }

    hideAutoRebetMessage() {
        this.setStopAutoRebetVisible(false);
        this.isAutoRebetMessageVisible = false;

        const autoRebetMessage = this.lblAutoRebetCount.node.parent;
        cc.tween(autoRebetMessage)
            .to(0.5, { scale: 0, opacity: 0 }, { easing: cc.easing.backIn })
            .call(() => {
                autoRebetMessage.active = false;
            })
            .start();
    }

    clickReBet() {
        this.soloBetModel.reBet();
    }

    resetBetWinAmount() {
        this.betWinAmount = 0;
    }

    clickTopUpBalance() {
        GameUtils.sendActionToParent(WEBVIEW_ACTION.OPEN_RECHARGE_PANEL);
    }

    private getCloseGameDialogContent(): string {
        const MSG_CLOSE_PLACED_BET = i18n.t("MiniRoulette.alert_close_game_place_bet");
        const MSG_CLOSE_NOT_PLACED_BET = i18n.t("MiniRoulette.alert_close_game");
        const hasBet = this.soloBetModel.existBet && this.soloBetModel.existBet();
        const isRoundNotReady = this.soloBetModel.state !== SoloBetState.READY;
        return hasBet && isRoundNotReady ? MSG_CLOSE_PLACED_BET : MSG_CLOSE_NOT_PLACED_BET;
    }

    clickCloseGame() {
        this.playClick();

        if (this.isCloseGameDialogOpen) {
            return;
        }

        GameUtils.sendActionToParent(WEBVIEW_ACTION.RECEIVED_CLOSE_EVENT);

        this.isCloseGameDialogOpen = true;
        const dialog = cc.instantiate(this.closeGameDialogPrefab);
        const comp = dialog.getComponent(CloseGameDialog);
        this.currentMiniPanel.node.addChild(dialog);
        const content = this.getCloseGameDialogContent();
        comp.setContent(content);

        comp.onConfirmCallback = () => {
            cc.log("Confirm Close, Send Message to Native App");
            this.isCloseGameDialogOpen = false;
            GameUtils.sendActionToParent(WEBVIEW_ACTION.CLOSE);
        };

        const commonDialog = comp.mainFrame.getComponent(CommonDialog);
        if (commonDialog) {
            commonDialog.addOnDidHide(() => {
                this.isCloseGameDialogOpen = false;
            });
        }
        comp.btnCancel.node.once("click", () => {
            this.isCloseGameDialogOpen = false;
        });
    }

    override showStatus(status: any) {
        const { win, bet } = status;

        if (win) {
            this.showWinningBet(bet);
            this.updateUserBalance();
            this.betWinAmount = bet;
        }
    }

    onBetClick(choice: string) {
        const amount = this.currentBet;

        if (this.isAutoRebetMode() || !this.checkAvailableBetChoices(choice, amount) || !this.checkAvailableBalance(amount)) {
            return;
        }

        if (this.isWaitingForBetResponse) {
            this.showProcessingWarning(true);
            return;
        }

        this.pendingBetChoice = choice;
        this.pendingBetAmount = this.currentBet;
        this.isWaitingForBetResponse = true;
        this.setAutoRebetInteractable(false);

        this.onPlaceBet({ [choice]: this.currentBet });
    }

    checkAvailableBetChoices(choice: string, amount: number): boolean {
        return true;
    }

    checkAvailableBalance(amount: number): boolean {
        const available = amount <= userManager.balance;

        if (!available) {
            this.showMiniWarning(i18n.t("messages.notEnoughMoney"));
            GameUtils.sendActionToParent(WEBVIEW_ACTION.OPEN_RECHARGE_PANEL);
        }

        return available;
    }

    calculateLastBets(bets: ChoiceBet[]): number {
        return bets.reduce((acc, bet) => acc + bet.amount, 0);
    }

    private isAutoRebetMode(): boolean {
        return (
            this.autoRebetCount > 0 ||
            (this.autoRebetCount === 0 &&
                (this.soloBetModel.state === SoloBetState.SETTLEMENT || this.soloBetModel.state === SoloBetState.RESULT))
        );
    }

    listenMessageFromParent() {
        // Listen for messages from parent window (iframe communication)
        if (window && window.addEventListener) {
            window.addEventListener("message", (event) => {
                // Optionally, check event.origin for security
                this.handleMessageFromParent(event.data);
            });
        }
    }

    handleMessageFromParent(message: any) {
        // Example: handle different message types
        if (!message || typeof message !== "object") {
            return;
        }

        switch (message.action) {
            case WEBVIEW_ACTION.CLOSE:
                this.clickCloseGame();
                break;
            case WEBVIEW_ACTION.ON_RECHARGE_SUCCESS:
                this.updateUserBalance();
                break;
        }
    }
}
