import SedieRoundHistory from "../../../common/round-history/sedie/SedieRoundHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewSedieRoundHistory extends SedieRoundHistory {
    @property(cc.Label)
    red2: cc.Label = null;

    protected updateStatisticLabels({ oddValue, evenValue, red2Value, red3Value, red4Value, white3Value, white4Value, total }) {
        super.updateStatisticLabels({ oddValue, evenValue, red2Value, red3Value, red4Value, white3Value, white4Value, total });
        this.red2.string = `${red2Value}${this.suffix}`;
    }
}
