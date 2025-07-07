import RouletteUtils from "../../roulette/view-models/RouletteUtils";
import RouletteTopNumbersCount from "./roulette-top-numbers-count";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteStatisticsTopNumbers extends cc.Component {
    @property(cc.SpriteFrame)
    numberZeroBg: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    numberRedBg: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    numberBlackBg: cc.SpriteFrame = null;

    setData(list: { number: number; times: number }[]) {
        const items = this.getComponentsInChildren(RouletteTopNumbersCount);
        items.forEach((item, index) => {
            const data = list[index];
            const value = data.number;
            const count = data.times;
            const spriteFrame = value === 0 ? this.numberZeroBg : RouletteUtils.isRed(value) ? this.numberRedBg : this.numberBlackBg;
            item.setData({ value, count, spriteFrame });
        });
    }
}
