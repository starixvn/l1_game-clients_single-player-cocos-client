import MultiplayGameHistory from "../../multiplay/scripts/MultiplayGameHistory";
import MultiplayTableGame from "../../multiplay/scripts/MultiplayTableGame";
import MegaKeno from "./MegaKeno";
import { MegaKeno1Id, MegaKeno2Id, MegaKeno3Id, MegaKeno4Id, MegaKeno5Id, MegaKeno6Id, MegaKeno7Id, MegaKeno8Id } from "./MegaKenoConfig";
import MegaKenoGuide from "./MegaKenoGuide";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KenoMultiplay extends MultiplayTableGame {
    gameIds: number[] = [MegaKeno1Id, MegaKeno2Id, MegaKeno3Id, MegaKeno4Id, MegaKeno5Id, MegaKeno6Id, MegaKeno7Id, MegaKeno8Id];

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Node)
    bottomSubGameBg: cc.Node = null;

    private readonly sizeSubGame = 150;

    onLoad() {
        super.onLoad();
    }

    constructor() {
        super();
        this.gameId = MegaKeno1Id;
    }

    createMainGameUI(gameId: number) {
        const node = super.createMainGameUI(gameId);
        this.customEachGame(gameId);
        return node;
    }

    createSubGameUI(gameId: number, location: number) {
        const node = super.createSubGameUI(gameId, location);
        this.customEachGame(gameId);
        return node;
    }

    customEachGame(gameId: number) {
        const game = this.games[gameId] as MegaKeno;
        game.setGameId(gameId);
        game.customShowResultDuration();
    }

    openHistory() {
        super.openHistory();
        const dialog = cc.instantiate(this.historyPrefab);
        this.currentMiniPanel.addDialog(dialog);
        const control = dialog.getComponent(MultiplayGameHistory);
        control.initDefaultGame(this.gameId);
    }

    openGuide() {
        super.openGuide();
        const dialog = cc.instantiate(this.guidePrefab);
        this.currentMiniPanel.addDialog(dialog);
        const guide = dialog.getComponent(MegaKenoGuide);
        guide.games = this.games;
    }

    checkHandleScroll() {
        const offset = this.scrollView.getScrollOffset();
        const offsetEnableSubGameBg = this.scrollView.getMaxScrollOffset().y - this.sizeSubGame;
        this.bottomSubGameBg.active = offset.y < offsetEnableSubGameBg ? true : false;
    }
}
