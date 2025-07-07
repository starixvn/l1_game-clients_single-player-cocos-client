import RouletteResultNumber from "../../roulette/view-models/RouletteResultNumber";
import { CustomColor } from "./roulette-s-utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteBetItem extends RouletteResultNumber {
    @property(cc.Node)
    leftNode: cc.Node = null;

    @property(cc.Node)
    rightNode: cc.Node = null;

    @property(cc.Label)
    leftLabel: cc.Label = null;

    @property(cc.Label)
    rightLabel: cc.Label = null;

    protected readonly greenColor: string = CustomColor.green;
    protected readonly redColor: string = CustomColor.red;
    protected readonly blackColor: string = CustomColor.black;

    setNumber(number: number) {
        super.setNumber(number);
        const { left, right } = this.getNeighbourNumber(number);

        this.leftLabel.string = left.toString();
        this.rightLabel.string = right.toString();

        this.leftNode.color = this.getColor(left);
        this.rightNode.color = this.getColor(right);
    }

    getNeighbourNumber(number: number) {
        const list = [
            0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12,
            35, 3, 26
        ];
        const index = list.indexOf(number);
        if (index === -1) {
            return {
                left: 0,
                right: 0
            };
        }
        // Handle edge cases by wrapping around the list
        const leftIndex = index === 0 ? list.length - 1 : index - 1;
        const rightIndex = index === list.length - 1 ? 0 : index + 1;
        return {
            left: list[leftIndex],
            right: list[rightIndex]
        };
    }
}
