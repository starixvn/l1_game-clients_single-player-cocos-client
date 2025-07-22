import GameBase from "../../_base/GameBase";
import RouletteLeaderBoard from "./roulette-leader-board";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LeaderBoardLoader extends cc.Component {
    @property({ type: cc.Node })
    nodeRouletteS: cc.Node = null;

    private leaderBoardPrefab: cc.Prefab = null;
    private isLoading = false;

    async onLoad() {
        this.isLoading = true;
        try {
            const bundle = await this.loadBundleAsync("prefabs");
            this.leaderBoardPrefab = await this.loadPrefabAsync(bundle, "leader-board/leader-board-dialog");
        } catch (error) {
            console.error("LeaderBoardLoader: Failed to load leaderboard prefab on load.", error);
        } finally {
            this.isLoading = false;
        }
    }

    private loadBundleAsync(bundleName: string): Promise<cc.AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            cc.assetManager.loadBundle(bundleName, (err, bundle) => (err ? reject(err) : resolve(bundle)));
        });
    }

    private loadPrefabAsync(bundle: cc.AssetManager.Bundle, path: string): Promise<cc.Prefab> {
        return new Promise((resolve, reject) => {
            bundle.load(path, cc.Prefab, (err, prefab: cc.Prefab) => (err ? reject(err) : resolve(prefab)));
        });
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
            if (!game) {
                throw new Error("GameBase component not found on the provided node.");
            }

            const dialog = cc.instantiate(this.leaderBoardPrefab);
            const leaderBoardComponent = dialog.getComponent(RouletteLeaderBoard);

            if (leaderBoardComponent) {
                leaderBoardComponent.init(game.socket, game.gameName);
                this.node.parent.addChild(dialog);
            } else {
                throw new Error("RouletteLeaderBoard component not found on the instantiated prefab.");
            }
        } catch (error) {
            console.error("LeaderBoardLoader: Failed to show leaderboard.", error);
        }
    }
}
