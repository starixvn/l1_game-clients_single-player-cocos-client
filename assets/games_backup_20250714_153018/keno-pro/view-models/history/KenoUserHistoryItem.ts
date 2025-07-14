import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import KenoHistoryItem from "../KenoHistoryItem";
import KenoUserHistory from "./KenoUserHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KenoUserHistoryItem extends KenoHistoryItem {
    @property(cc.Label)
    total: cc.Label = null;

    public roundId: number;
    public totalResult: number;
    public result: number[];
    public settlementResult: any;
    private main: KenoUserHistory;

    public initMain(main: KenoUserHistory): void {
        this.main = main;
    }

    public showResult(): void {
        this.main.showRoundResult(this.roundId, this.totalResult, this.result, this.settlementResult);
    }

    onDisable() {
        this.main.hideRoundResult();
        this.node.destroy();
    }

    setData(betLog: any, index: number) {
        const { time, phien, result, betwin, settlementResult } = betLog;

        this.node.active = true;
        this.time.string = getStringDateByTime(time);
        this.roundId = phien;
        this.round.string = phien;
        this.win.string = numberWithCommas(betwin, 2);

        let total = 0;
        result.forEach((resultItem) => {
            total += resultItem;
        });

        this.total.string = numberWithCommas(total);
        this.settlementResult = settlementResult;
        this.totalResult = total;
        this.result = result;
        this.setBasicData(betLog);
        this.setBackground(index);
    }
}
