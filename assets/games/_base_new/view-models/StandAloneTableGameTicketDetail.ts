import GameTicketDetailBase from "../../_base/view-models/GameTicketDetailBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandAloneTableGameTicketDetail extends GameTicketDetailBase {
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Label)
    roundId: cc.Label = null;

    setData(data: any) {}
}
