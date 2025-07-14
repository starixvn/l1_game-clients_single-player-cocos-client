import MultiplayGame from "../../multiplay/scripts/MultiplayGame";
import UnbalancedBigSmall from "./UnbalancedBigSmall";
import { UnbalancedBigSmall1Id, UnbalancedBigSmall2Id, UnbalancedBigSmall3Id, UnbalancedBigSmall4Id } from "./UnbalancedBigSmallConfig";
import UnbalancedBigSmallSubGame from "./UnbalancedBigSmallSubGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UnbalancedBigSmallMultiplay extends MultiplayGame {
    gameIds: number[] = [UnbalancedBigSmall1Id, UnbalancedBigSmall2Id, UnbalancedBigSmall3Id, UnbalancedBigSmall4Id];

    constructor() {
        super();
        this.gameId = UnbalancedBigSmall1Id;
    }

    createSubGameUI(gameId: number, location: number): cc.Node {
        const node = super.createSubGameUI(gameId, location);
        const multiplaySingle = node.getComponent(UnbalancedBigSmallSubGame);
        multiplaySingle.setGameId(gameId);
        return node;
    }

    addSubGameUI(gameId: number, location: number) {
        const subGameNode = super.addSubGameUI(gameId, location);
        if (subGameNode) {
            const multiplaySingle = subGameNode.getComponent(UnbalancedBigSmallSubGame);
            multiplaySingle.miniRoundHistory && (multiplaySingle.miniRoundHistory.tip.node.opacity = 0);
            multiplaySingle.isMainGame = false;
        }

        return subGameNode;
    }

    createMainGameUI(gameId: number) {
        const node = super.createMainGameUI(gameId);
        const multiplaySingle = node.getComponent(UnbalancedBigSmall);
        multiplaySingle.setGameId(gameId);
        return node;
    }
}
