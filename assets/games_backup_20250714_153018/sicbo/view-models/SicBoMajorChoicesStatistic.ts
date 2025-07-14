import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import SicBo from "./SicBo";
import { SicBoBetType } from "./SicBoCommon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoMajorChoicesStatistic extends cc.Component {
    @property(cc.Label)
    big: cc.Label = null;

    @property(cc.Label)
    small: cc.Label = null;

    @property(cc.Label)
    anyTriple: cc.Label = null;

    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    private sicBo: SicBo = null;

    init(sicbo: SicBo) {
        this.sicBo = sicbo;
        this.updateData(sicbo.currentDataLogs);
        const condition = sicbo.checkConditionUpdateRoundHistory();

        this.logControl.init(condition);
    }

    updateData(dataLogs: any[]) {
        this.updatePercentages(dataLogs);
        this.updateLogControl(dataLogs);
    }

    updatePercentages(dataLogs: any[]) {
        if (dataLogs.length > 0) {
            let bigTotal = 0,
                smallTotal = 0,
                anyTriple = 0;

            dataLogs.forEach((log) => {
                const { settlementResult } = log;

                bigTotal += settlementResult[SicBoBetType.big] ? 1 : 0;
                smallTotal += settlementResult[SicBoBetType.small] ? 1 : 0;
                anyTriple += settlementResult[SicBoBetType.anyTriple] ? 1 : 0;
            });

            const length = dataLogs.length;

            const bigPercentage = Math.round((bigTotal / length) * 100);
            const smallPercentage = Math.round((smallTotal / length) * 100);
            const anyTriplePercentage = Math.round((anyTriple / length) * 100);

            this.big.string = `${bigPercentage}%`;
            this.small.string = `${smallPercentage}%`;
            this.anyTriple.string = `${anyTriplePercentage}%`;
        }
    }

    updateLogControl(dataLogs: any[]) {
        const logControlData = [];

        for (const dataLog of dataLogs) {
            const { settlementResult } = dataLog;
            logControlData.unshift(settlementResult[SicBoBetType.anyTriple] ? 2 : settlementResult[SicBoBetType.big] ? 0 : 1);
        }

        this.logControl.setData(logControlData);
    }
}
