import GameUtils, { MINI_GAMES_SCALE_ON_DESKTOP } from "../../../common/GameUtils";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import MultiplayGameHistory from "./MultiplayGameHistory";

const { ccclass } = cc._decorator;

export const KeyStorageStatisticOpen = "MultiStatisticStatus";

@ccclass
export default abstract class MultiplayGameSingle extends MiniGameBase {
    protected override managedByContainer = true;
    public isMiniGameInContainer = true;
    public isBetSound = false;
    protected showStatistic = true;
    protected statisticHistory: cc.Component = null;
    protected groupDefaultGameId: number;
    isMainGame = true;

    onEnable() {
        super.onEnable();
        this.initStatusStatistic();
    }

    customScaleNode(node: cc.Node) {
        if (this.isMainGame) {
            return;
        }
        node.scale = !cc.sys.isMobile ? MINI_GAMES_SCALE_ON_DESKTOP : 1;
    }

    showAcceptedBet(bet: number) {
        const node = GameUtils.addFlyingText(this.noticeNode, false, bet, 1);
        this.customScaleNode(node);
    }

    showWinningBet(bet: number) {
        const node = GameUtils.addFlyingText(this.noticeNode, true, bet, 4);
        node.name = "winningBet";
        this.customScaleNode(node);
    }

    public openHistory() {
        const dialog = cc.instantiate(this.historyPrefab);
        this.currentMiniPanel.addDialog(dialog);
        const control = dialog.getComponent(MultiplayGameHistory);
        control.initDefaultGame(this.gameId);
    }

    private initStatusStatistic() {
        const status = this.getStorageStatusStatistic();
        this.handleShowStatistic(status);
        this.showStatistic = status;
    }

    private openStatistic() {
        this.showStatistic = !this.showStatistic;
        this.handleShowStatistic(this.showStatistic);
        this.gameData.changeStatusShowStatistic(this.showStatistic);
    }

    private handleShowStatistic(show: boolean) {
        this.statisticHistory && (this.statisticHistory.node.active = show);
    }

    private getStorageStatusStatistic(): boolean {
        return GameUtils.getSubGameSetting(this.groupDefaultGameId, KeyStorageStatisticOpen) ?? true;
    }
}
