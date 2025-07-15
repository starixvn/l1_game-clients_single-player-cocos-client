import GameUtils from "../../../../common/GameUtils";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import GameTicketDetailItemBase from "../../../_base/view-models/GameTicketDetailItemBase";
import { RouletteBetType } from "../../../roulette/view-models/RouletteCommon";
import { getStringHourByTime } from "../../../../common/helpers/DateTimeHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class MiniRouletteTicketDetailItem extends GameTicketDetailItemBase {
    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Label)
    stake: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    start(): void {
        //
    }

    createBetLogItem(betLog: any, settlementResult: any, odds: Record<string, number>) {
        this.timeLabel.string = getStringHourByTime(betLog.time);
        const betTypes = [RouletteBetType.StraightUp, RouletteBetType.Dozen, RouletteBetType.RedBlack, RouletteBetType.OddEven];
        betTypes.forEach((betType) => {
            const betList = betLog[betType];
            if (betList) {
                Object.keys(betList).forEach((betChoice) => {
                    const isWinning = settlementResult?.[betType]?.includes(betChoice);
                    this.updateContent(betType, betChoice, betList[betChoice], isWinning, odds);
                });
            }
        });
    }

    updateContent(type: string, choice: string, amount: number, isWinning: boolean, odds: Record<string, number>) {
        const choiceNames = {
            odd: GameUtils.getBetChoiceString("odd"),
            even: GameUtils.getBetChoiceString("even"),
            red: GameUtils.getBetChoiceString("red"),
            black: GameUtils.getBetChoiceString("black"),
            dozen1: "1-12",
            dozen2: "13-24",
            dozen3: "25-36"
        };

        switch (type) {
            case RouletteBetType.OddEven:
            case RouletteBetType.RedBlack:
                this.choice.string = choiceNames[choice];
                break;
            case RouletteBetType.Dozen:
                this.choice.string = choiceNames[type + choice];
                break;
            default:
                this.choice.string = choice;
        }

        this.timeLabel.node.color = isWinning ? cc.Color.YELLOW : cc.Color.WHITE;
        this.choice.node.color = isWinning ? cc.Color.YELLOW : cc.Color.WHITE;
        this.stake.node.color = isWinning ? cc.Color.YELLOW : cc.Color.WHITE;
        this.win.node.color = isWinning ? cc.Color.YELLOW : cc.Color.WHITE;
        this.stake.string = numberWithCommas(amount);
        this.win.string = isWinning ? numberWithCommas(amount * odds[type]) : "0";
    }
}
