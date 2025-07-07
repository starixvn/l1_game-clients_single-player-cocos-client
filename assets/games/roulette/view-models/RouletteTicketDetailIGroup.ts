import * as _ from "lodash";

import GameUtils from "../../../common/GameUtils";
import { getStringHourByTime } from "../../../common/helpers/DateTimeHelper";
import { RouletteBetType } from "./RouletteCommon";
import RouletteTicketDetailItem from "./RouletteTicketDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteTicketDetailIGroup extends cc.Component {
    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Node)
    betChoiceGroupNode: cc.Node = null;

    @property(cc.Prefab)
    betItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    bg: cc.Node = null;

    onLoad() {
        GameUtils.setFontSizeLabelsInNode(this.node);
        this.betChoiceGroupNode.children.forEach((child) => child.destroy());
    }

    onDisable() {
        this.betChoiceGroupNode.destroyAllChildren();
    }

    createBetLogItem(betLogs: any, settlementResult: any, index: number) {
        this.timeLabel.string = getStringHourByTime(betLogs.time);

        let height = 0;
        const orderDictionary = [
            RouletteBetType.StraightUp,
            RouletteBetType.Split,
            RouletteBetType.Street,
            RouletteBetType.Triangle,
            RouletteBetType.Corner,
            RouletteBetType.FourNumbers,
            RouletteBetType.Line,
            RouletteBetType.Column,
            RouletteBetType.Dozen,
            RouletteBetType.RedBlack,
            RouletteBetType.OddEven,
            RouletteBetType.BigSmall
        ];

        const orderResults = {};
        orderDictionary.forEach((key) => {
            if (betLogs[key]) {
                orderResults[key] = betLogs[key];
            }
        });

        Object.keys(orderResults).forEach((betType) => {
            const betList = orderResults[betType];
            const result = settlementResult[betType];

            if (_.size(betList) > 0) {
                Object.keys(betList).forEach((betKey, betIndex) => {
                    height += this.createTicketDetailItem(betList, result, betKey, betType, betIndex);
                });
            }
        });

        this.node.height = height;
        this.bg.active = index % 2 > 0;
        this.bg.height = height;
    }

    private createTicketDetailItem(betList: any, result: any, betKey: string, betType: string, index: number): number {
        if (!this.betItemPrefab) {
            return 0;
        }
        const betItem = cc.instantiate(this.betItemPrefab);
        const betItemComponent = betItem.getComponent(RouletteTicketDetailItem);
        this.betChoiceGroupNode.addChild(betItem);
        const isWinning = result && result.indexOf(betKey) !== -1;
        betItemComponent.updateContent(betType, betKey, betList[betKey], isWinning, index);
        return betItemComponent.height;
    }
}
