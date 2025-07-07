import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import MultiplayGameHistoryItem from "../../../multiplay/scripts/MultiplayGameHistoryItem";
import MegaKenoHistory from "./MegaKenoHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaKenoHistoryItem extends MultiplayGameHistoryItem {
    @property(cc.Node)
    choices: cc.Node = null;

    @property(cc.Label)
    total: cc.Label = null;

    public result: number[];
    public settlementResult: any;
    public betLogDetails: any[];
    private main: MegaKenoHistory;

    initMain(main: MegaKenoHistory) {
        this.main = main;
    }

    onTotalClick() {
        this.main.dropdownList.closeDropDown();
        this.main.showHistoryDetail(this.round.string, this.result, this.settlementResult);
    }

    setData(betLog: any, index) {
        super.setData(betLog, index);
        const betChoices = this.choices.getComponentsInChildren(cc.Label);
        const { phien, betLogDetails, betwin, result, settlementResult } = betLog;

        this.node.active = true;
        this.result = result;
        this.settlementResult = settlementResult;
        this.betLogDetails = betLogDetails;
        this.time.string = getStringDateByTime(betLog.time);
        this.round.string = phien;

        betChoices.forEach((item) => {
            item.string = numberWithCommas(betLog[item.node.name]);
            if (settlementResult[item.node.name]) {
                item.node.color = cc.Color.YELLOW;
            }
        });

        const total = result.reduce((resultTotal: number, number: number) => resultTotal + number, 0);
        this.total.string = total;
        this.win.string = numberWithCommas(betwin, 2);
    }
}
