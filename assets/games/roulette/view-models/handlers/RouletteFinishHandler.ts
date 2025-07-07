import GameUtils from "../../../../common/GameUtils";
import { appManager } from "../../../../managers/AppManager";
import { updateOtherPlayerBalance } from "../../../_base/action/OtherPlayerAction";
import { playWinningEffect } from "../../../_base/action/PayChipsAction";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import Roulette from "../Roulette";
import RouletteUtils from "../RouletteUtils";

export default class RouletteFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: Roulette) {
        super(main, 2);
    }

    handle(data: any): boolean {
        if (data.finish) {
            if (!appManager.GAME_IS_SHOWED) {
                return false;
            }
            this.clearDataBeforeHandleFinish();
            this.main.node.activeInHierarchy && this.main.gameAudios.playEndGameAudio();
            this.setNewGameRound(data);
            updateOtherPlayerBalance(data.finish.winningPlayers, this.main);
            this.handleFinishData(data.finish, () => {
                this.payChipToLoginUser();
                if (this.main.winnersData) {
                    this.payChipsFromBetChoices(this.main.winnersData);
                    this.main.winnersData = null;
                }
                this.main.finishShowResult = true;
                this.main.isDonePayingChip = true;
            });
        }

        return true;
    }

    moveChip(betNumber: number, startNode: cc.Node, destNode: cc.Node, duration: number) {
        const chip = RouletteUtils.createChips(betNumber, this.main.betChips);
        startNode.addChild(chip);

        const destWorldPosition = destNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const destLocalPosition = startNode.convertToNodeSpaceAR(destWorldPosition);
        chip.runAction(
            cc.sequence(
                cc.delayTime(0.2), //stay at startNode for awhile
                cc.moveTo(duration, destLocalPosition),
                cc.removeSelf(true)
            )
        );
    }

    payChipToLoginUser() {
        const data = this.main.statusHandler.currentStatusData;
        if (!data || !data.win) {
            return;
        }

        const playerNode = this.main.userProfile.node;
        this.main.showWinningBet(data.bet);
        playWinningEffect(this.main, playerNode, this.WinningAnimationDuration);
        this.main.updateUserBalance();
    }

    payChipsFromBetChoices(winningPlayers: any) {
        const duration = 0.7;

        for (const playerId in winningPlayers) {
            const data = winningPlayers[playerId];
            const playerSlot = this.main.playerHandler.getPlayerSlot(playerId);
            if (playerSlot) {
                cc.tween(this.main).delay(duration).call(this.showWinningEffect.bind(this, playerSlot, data)).start();
            }
        }
    }

    showWinningEffect(playerSlot, data) {
        playerSlot.increaseBalance(data.bet);
        const convertValue = GameUtils.getValueByCurrency(data.bet, data.rate || 1);
        GameUtils.addFlyingText(playerSlot.node, true, convertValue, 3, 0, 10);
        playWinningEffect(this.main, playerSlot.node, this.WinningAnimationDuration);
    }

    public handleFinishData(dataFinish, onFinishHanlingData: () => void = null) {
        this.main.showWheelResult(dataFinish.result, () => {
            this.main.currentDataLogs.unshift(dataFinish);
            this.main.currentDataLogs.length > 300 && this.main.currentDataLogs.pop();
            this.main.updateMiniRoundResult(true);
            this.main.rouletteMain.board.clearOtherBetChoices();
            onFinishHanlingData();
        });
    }
}
