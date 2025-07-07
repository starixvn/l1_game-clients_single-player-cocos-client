import { numberPad } from "../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoundTime extends cc.Component {
    @property(cc.Label)
    time: cc.Label = null;

    protected readonly timeToChangeColor = 5;

    setTime(time: number) {
        this.time.string = `${numberPad(time, 2)}`;
        const color = time > this.timeToChangeColor ? cc.Color.WHITE : cc.Color.RED;
        this.time.node.color = color;
    }
}
