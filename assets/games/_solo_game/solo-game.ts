import NewGameData from "../_base_new/models/NewGameData";
import StandAloneTableGameBase from "../_base_new/view-models/StandAloneTableGameBase";
import { SoloBetModel, SoloBetState } from "./solo-bet-model";
import SoloGameData from "./solo-game-data";
import { Durations } from "../_new/_base/game-data-management/models/durations";
import AutoRebetDialog from "../../common/auto-rebet-dialog/AutoRebetDialog";
import { onAutoRebetDialogInitialized } from "../_base/action/GameRoomActions";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SoloGame extends StandAloneTableGameBase {
    @property(cc.Button)
    btnSpin: cc.Button = null;

    @property(cc.Prefab)
    autoRebetDialogPrefab: cc.Prefab = null;

    betWinAmount = 0;
    autoRebetDialog: AutoRebetDialog = null;

    onLoad() {
        super.onLoad();
        this.animatedTime.setAnimatedY(20, -10);
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
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CONFIRM_BET, () => (bet) => this.onConfirmBet(bet));

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

    onConfirmBet(bet: any) {
        this.sendSocketData("spin", null);
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

        this.currentMiniPanel.node.addChild(dialog);
    }

    clickReBet() {
        this.soloBetModel.reBet();
    }

    resetBetWinAmount() {
        this.betWinAmount = 0;
    }

    notifyOpenRechargePanel() {
        try {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: "openRechargePanel" }));
                return;
            }
            if ((window as any).Android && typeof (window as any).Android.openRechargePanel === "function") {
                (window as any).Android.openRechargePanel();
                return;
            }
    
            if ((window as any).JSBridge && typeof (window as any).JSBridge.openRechargePanel === "function") {
                (window as any).JSBridge.openRechargePanel();
                return;
            }
    
            if (
                (window as any).webkit &&
                (window as any).webkit.messageHandlers &&
                (window as any).webkit.messageHandlers.openRechargePanel
            ) {
                (window as any).webkit.messageHandlers.openRechargePanel.postMessage({});
                return;
            }
    
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: "openRechargePanel" }, "*");
                return;
            }
        } catch (e) {
            cc.log("Error calling openRechargePanel:", e);
        }
    }

    clickTopUpBalance() {
        this.notifyOpenRechargePanel();
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
