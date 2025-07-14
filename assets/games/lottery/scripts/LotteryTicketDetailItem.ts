import GameUtils from "../../../common/GameUtils";
import { getStringHourByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { userManager } from "../../../common/user/UserManager";
import LotteryHelper from "./LotteryHelper";
import LotteryTicketDetailSubItem from "./LotteryTicketDetailSubItem";

const { ccclass, property } = cc._decorator;

interface Data {
    time: string;
    choices: any;
}

@ccclass
export default class LotteryTicketDetailItem extends cc.Component {
    @property(cc.Node)
    background: cc.Node = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    subItemSample: cc.Node = null;

    @property(cc.Node)
    lineBottom: cc.Node = null;

    start() {
        GameUtils.setFontSizeLabelsInNode(this.node);
    }

    setData(data: Data, index: number, generalData: any) {
        this.background.active = index % 2 !== 0;
        this.time.string = getStringHourByTime(data.time);
        this.createSubItems(data.choices, generalData);
        this.syncHeightWithContent();
    }

    createSubItems(choices: any, generalData: any) {
        const { settlementResult, odds } = generalData;
        Object.keys(choices).forEach((choiceKey) => {
            const values = choices[choiceKey];
            Object.keys(values).forEach((choiceValue, index) => {
                const winCount = LotteryHelper.getWinOnChoice(choiceKey, choiceValue, settlementResult);
                const bet = numberWithCommas(values[choiceValue]);
                const oddsValue = userManager.fractionalOddsFormat ? numberWithCommas(+odds[choiceKey] - 1, 2) : odds[choiceKey];
                const ratio = winCount > 1 ? `${oddsValue} (x${winCount})` : `${oddsValue}`;
                const winAmount = odds[choiceKey] * winCount * values[choiceValue];
                const win = numberWithCommas(winAmount, 2);
                const isOthers = choiceKey === "others";
                const choiceDetail = {
                    type: LotteryHelper.getNameChoiceKey(choiceKey),
                    choice: isOthers ? GameUtils.getBetChoiceString(choiceValue) : choiceValue.split("-").join(", "),
                    ratio: ratio,
                    bet: bet,
                    win: win
                };

                const node = cc.instantiate(this.subItemSample);
                this.content.addChild(node);
                node.active = true;

                const subItem = node.getComponent(LotteryTicketDetailSubItem);
                subItem.setData(choiceDetail);
                subItem.setHighlight(winAmount > 0);
                subItem.lineTop.active = index > 0;
            });
        });
    }

    syncHeightWithContent() {
        const layout = this.content.getComponent(cc.Layout);
        layout.updateLayout();
        this.node.height = this.content.height;
    }
}
