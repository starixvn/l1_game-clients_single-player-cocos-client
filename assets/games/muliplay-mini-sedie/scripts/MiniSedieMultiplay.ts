import MultiplayGame from "../../multiplay/scripts/MultiplayGame";
import MiniSedie from "./MiniSedie";
import { MiniSedie1Id, MiniSedie2Id, MiniSedie3Id, MiniSedie4Id } from "./MiniSedieConfigs";
import MiniSedieSubGame from "./MiniSedieSubGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniSedieMultiplay extends MultiplayGame {
    gameIds: number[] = [MiniSedie1Id, MiniSedie2Id, MiniSedie3Id, MiniSedie4Id];

    constructor() {
        super();
        this.gameId = MiniSedie1Id;
    }
    onLoad() {
        super.onLoad();
        this.node && (this.node.y = -75); // customize for theme noel 2024
    }

    createSubGameUI(gameId: number, location: number): cc.Node {
        const node = super.createSubGameUI(gameId, location);
        const multiplaySingle = node.getComponent(MiniSedieSubGame);
        multiplaySingle.setGameId(gameId);
        return node;
    }

    addSubGameUI(gameId: number, location: number) {
        const subGameNode = super.addSubGameUI(gameId, location);
        if (subGameNode) {
            const multiplaySingle = subGameNode.getComponent(MiniSedieSubGame);
            multiplaySingle.miniRoundHistory && (multiplaySingle.miniRoundHistory.tip.node.opacity = 0);
            multiplaySingle.isMainGame = false;
        }

        return subGameNode;
    }

    createMainGameUI(gameId: number) {
        const node = super.createMainGameUI(gameId);
        const multiplaySingle = node.getComponent(MiniSedie);
        multiplaySingle.setGameId(gameId);
        return node;
    }
}
