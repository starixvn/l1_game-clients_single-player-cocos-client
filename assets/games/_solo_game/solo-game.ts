import NewGameData from "../_base_new/models/NewGameData";
import StandAloneTableGameBase from "../_base_new/view-models/StandAloneTableGameBase";
import { ChoiceBet, SoloBetModel, SoloBetState } from "./solo-bet-model";
import SoloGameData from "./solo-game-data";
import { Durations } from "../_new/_base/game-data-management/models/durations";
import AutoRebetDialog from "../../common/auto-rebet-dialog/AutoRebetDialog";
import GameUtils from "../../common/GameUtils";
import CloseGameDialog from "../../common/close-game-dialog/CloseGameDialog";

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

    betWinAmount = 0;
    autoRebetCount = 0;

    onLoad() {
        super.onLoad();
        this.animatedTime.setAnimatedY(20, -10);
        this.hideAutoRebetMessage();
        this.resetAutoRebetCount();
    }

    get soloBetModel() {
        return this.gameData.betModel as SoloBetModel;
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

        this.onStateChange(this.soloBetModel.state);
    }

    onStateChange(state: string) {
        // override
    }

    updateSpinButtonInteractable() {
        const state = this.soloBetModel.state;
        const isStateCanBet =
            state === SoloBetState.BETTING_FAILED || state === SoloBetState.SETTLEMENT || state === SoloBetState.STARTING_ROUND;
        this.btnSpin.interactable = this.soloBetModel.existBet() && isStateCanBet;
    }

    onConfirmBet() {
        this.sendSocketData("settle", null);
    }

    onReBet(bet: any) {
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
        this.gameData.durations.remaining = this.config.minBetTime;
        this.soloBetModel.confirmBet();
    }

    clickAutoRebet() {
        this.playClick();
        const dialog = cc.instantiate(this.autoRebetDialogPrefab);
        const comp = dialog.getComponent(AutoRebetDialog);
        this.currentMiniPanel.node.addChild(dialog);

        comp.onConfirmCallback = (autoRebetCount: number) => {
            this.handleAutoRebet(autoRebetCount);
        };
    }

    clickStopAutoRebet() {
        this.hideAutoRebetMessage();
        this.resetAutoRebetCount();
    }

    handleAutoRebet(autoRebetCount: number) {
        const betObject = this.convertBetQueueToBetObject(this.soloBetModel.lastQueueBet);
        this.onReBet(betObject);

        this.autoRebetCount = autoRebetCount - 1;
        this.setAutoRebetInteractable(false);

        if (this.autoRebetCount > 0) {
            this.updateAutoRebetCount();
            this.showAutoRebetMessage();
            this.nodeStopAutoRebet.active = true;
        }
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
        this.lblAutoRebetCount.string = this.autoRebetCount.toString();
    }

    resetAutoRebetCount() {
        this.autoRebetCount = 0;
        this.setAutoRebetInteractable(false);
    }

    setAutoRebetInteractable(isInteractable: boolean) {
        this.btnAutoRebet.interactable = isInteractable;
    }

    showAutoRebetMessage() {
        this.nodeStopAutoRebet.active = true;

        const autoRebetMessage = this.lblAutoRebetCount.node.parent;
        autoRebetMessage.active = true;
        autoRebetMessage.scale = 0;
        autoRebetMessage.opacity = 0;

        cc.tween(autoRebetMessage).to(0.5, { scale: 1, opacity: 255 }, { easing: "backOut" }).start();
    }

    hideAutoRebetMessage() {
        this.nodeStopAutoRebet.active = false;

        const autoRebetMessage = this.lblAutoRebetCount.node.parent;
        cc.tween(autoRebetMessage)
            .to(0.5, { scale: 0, opacity: 0 }, { easing: "backIn" })
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
        GameUtils.notifyNativeApp("openRechargePanel");
    }

    clickCloseGame() {
        cc.log("clickCloseGame");
        GameUtils.notifyNativeApp("close");
        this.playClick();
        const dialog = cc.instantiate(this.closeGameDialogPrefab);
        const comp = dialog.getComponent(CloseGameDialog);
        this.currentMiniPanel.node.addChild(dialog);

        let content = "";
        if (this.soloBetModel.state === SoloBetState.SETTLEMENT) {
            content = "是否要離開遊戲？";
        } else {
            content = "您已完成下注，離開仍會進行遊戲開獎喔";
        }
        comp.setContent(content);

        comp.onConfirmCallback = () => {
            GameUtils.notifyNativeApp("close");
        };
    }

    override showStatus(status: any) {
        const { win, bet } = status;

        if (win) {
            this.showWinningBet(bet);
            this.updateUserBalance();
            this.betWinAmount = bet;
        }
    }
}
