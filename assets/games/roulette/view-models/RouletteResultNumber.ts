import RouletteUtils from "./RouletteUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteResultNumber extends cc.Component {
    @property(cc.Sprite)
    background: cc.Sprite = null;

    @property(cc.Label)
    label: cc.Label = null;

    protected readonly greenColor: string = "#145c1c";
    protected readonly redColor: string = "#b80201";
    protected readonly blackColor: string = "#000000";

    setNumber(number: number) {
        this.label.string = number.toString();
        this.background.node.color = this.getColor(number);
        this.show();
    }

    protected getColor(number: number) {
        const color = cc.Color.BLACK;
        return number === 0
            ? color.fromHEX(this.greenColor)
            : RouletteUtils.isRed(number)
            ? color.fromHEX(this.redColor)
            : color.fromHEX(this.blackColor);
    }

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }
}
