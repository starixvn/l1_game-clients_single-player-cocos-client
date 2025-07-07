import RoomPlayer from "../../_base/view-models/RoomPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TopControls extends cc.Component {
    @property({ type: RoomPlayer })
    players: RoomPlayer[] = [];

    @property({ type: cc.Node })
    otherPlayers: cc.Node = null;

    onLoad() {
        this.players.forEach((player) => (player.node.active = false));
    }
}
