import GameUtils from "../../../common/GameUtils";
import GameBase from "../../_base/GameBase";
import RouletteLeaderBoard from "./roulette-leader-board";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LeaderBoardLoader extends cc.Component {
    @property({ type: cc.Node })
    nodeRouletteS: cc.Node = null;

    private leaderBoardPrefab: cc.Prefab = null;
    private isLoading = false;

    onLoad() {
        this.isLoading = true;
        try {
            this.loadResource().then((prefab) => {
                this.leaderBoardPrefab = prefab;
            });
        } catch (error) {
            console.error("LeaderBoardLoader: Failed to load leaderboard prefab on load.", error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadResource() {
        const path = `games/roulette-s/leader-board-dialog`;
        const prefab = await GameUtils.loadResource(path);
        return prefab;
    }

    public showLeaderBoard() {
        if (this.isLoading) {
            console.warn("LeaderBoardLoader: still loading prefab.");
            return;
        }

        if (!this.leaderBoardPrefab) {
            console.error("LeaderBoardLoader: Prefab not loaded yet. It might have failed during onLoad.");
            return;
        }

        if (!this.nodeRouletteS || !this.node.parent) {
            console.error("LeaderBoardLoader is not configured correctly in the editor.");
            return;
        }

        try {
            const game = this.nodeRouletteS.getComponent(GameBase) as any;
            if (!game) return;

            const dialog = cc.instantiate(this.leaderBoardPrefab);
            const leaderBoardComponent = dialog.getComponent(RouletteLeaderBoard);

            if (leaderBoardComponent) {
                leaderBoardComponent.init(game.socket, game.gameName);
                this.node.parent.addChild(dialog);
            }
        } catch (error) {
            console.error("LeaderBoardLoader: Failed to show leaderboard.", error);
        }
    }
}
