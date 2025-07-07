import GameTicketDetailBase from "../../_base/view-models/GameTicketDetailBase";
import RouletteTicketDetailIGroup from "./RouletteTicketDetailIGroup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteTicketDetail extends GameTicketDetailBase {
    @property(cc.Label)
    roundLabel: cc.Label = null;

    @property(cc.Label)
    resultLabel: cc.Label = null;

    @property(cc.Prefab)
    groupPrefab: cc.Prefab = null;

    roundID = 2000;
    result = 20;

    HEIGHT_BET_DETAIL_TABLE = 550;
    WIDTH_BET_DETAIL_TABLE = 930;

    public showbetLogs() {
        this.node.active = true;
        this.betLogDetails.forEach((log, index) => {
            const group = cc.instantiate(this.groupPrefab);
            const groupComponent = group.getComponent(RouletteTicketDetailIGroup);
            this.content.addChild(group);
            groupComponent.createBetLogItem(log, this.settlementResult, index);
        });
    }

    setRouletteData(round: number, result: number) {
        this.roundLabel.string = round.toString();
        this.resultLabel.string = result.toString();
    }
}
