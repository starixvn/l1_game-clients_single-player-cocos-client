import BigSmallDicesStatistic from "../../bigsmall/view-models/BigSmallDicesStatistic";

const { ccclass } = cc._decorator;

@ccclass
export default class TurboOddEvenDicesStatistic extends BigSmallDicesStatistic {
    get getChoices(): string[] {
        return ["even", "odd"];
    }

    get getChoicesDefault(): string {
        return "even";
    }
}
