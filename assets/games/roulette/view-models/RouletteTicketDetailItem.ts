import * as _ from "lodash";

import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import GameTicketDetailItemBase from "../../_base/view-models/GameTicketDetailItemBase";
import { RouletteBetType } from "./RouletteCommon";

const { ccclass, property } = cc._decorator;
@ccclass
export default class RouletteTicketDetailItem extends GameTicketDetailItemBase {
    @property(cc.Label)
    type: cc.Label = null;

    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Label)
    amount: cc.Label = null;

    height: number = null;

    updateContent(type: string, choice: string, amount: number, isWinning: boolean, index: number) {
        const choiceNames = {
            small: "1-18",
            big: "19-36",
            odd: GameUtils.getBetChoiceString("odd"),
            even: GameUtils.getBetChoiceString("even"),
            red: GameUtils.getBetChoiceString("red"),
            black: GameUtils.getBetChoiceString("black"),
            dozen1: "1-12",
            dozen2: "13-24",
            dozen3: "25-36",
            column1: GameUtils.getText(`ui.column_number`, { num: 1 }),
            column2: GameUtils.getText(`ui.column_number`, { num: 2 }),
            column3: GameUtils.getText(`ui.column_number`, { num: 3 })
        };

        const betTypes = {
            straightUp: "type_straight_up",
            split: "type_split",
            street: "type_street",
            triangle: "type_triangle",
            corner: "type_corner",
            fourNumbers: "type_4number",
            line: "type_line",
            column: "type_column",
            dozen: "type_dozen",
            redBlack: "type_red_black",
            oddEven: "type_odd_even",
            bigSmall: "type_big_small"
        };

        this.type.string = GameUtils.getText(`ui.${betTypes[type]}`);
        switch (type) {
            case RouletteBetType.BigSmall:
            case RouletteBetType.OddEven:
            case RouletteBetType.RedBlack:
                this.choice.string = choiceNames[choice];
                break;
            case RouletteBetType.Dozen:
            case RouletteBetType.Column:
                this.choice.string = choiceNames[type + choice];
                break;
            case RouletteBetType.Split:
            case RouletteBetType.Street:
            case RouletteBetType.Triangle:
            case RouletteBetType.Corner:
            case RouletteBetType.FourNumbers:
                const list = _.split(choice, "-");
                this.choice.string = _.join(list, ", ");
                break;
            case RouletteBetType.Line:
                const array = _.split(choice, "-");
                const firstArray = _.slice(array, 0, 3);
                const secondArray = _.slice(array, 3, 6);
                this.choice.string = `${_.join(firstArray, ", ")}\n${_.join(secondArray, ", ")}`;
                this.node.height = 48;
                break;
            default:
                this.choice.string = choice;
        }

        this.choice.node.color = isWinning ? cc.Color.YELLOW : cc.Color.WHITE;
        this.amount.string = numberWithCommas(amount);
        this.amount.node.color = isWinning ? cc.Color.YELLOW : cc.Color.WHITE;
        this.height = this.node.height;
    }
}
