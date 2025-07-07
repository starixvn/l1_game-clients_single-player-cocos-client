import ColorAssembler2D from "../../../common/ColorAssembler2D";
import { numberPad } from "../../../common/helpers/NumberHelper";
import RoundTime from "../RoundTime";

const { ccclass } = cc._decorator;

@ccclass
export default class RoundTimeTheme extends RoundTime {
    override setTime(time: number) {
        this.time.string = `${numberPad(time, 2)}`;
        if (time > this.timeToChangeColor) {
            this.updateDefaultColorNode();
        } else {
            this.updateRedColorNode();
        }
    }

    updateRedColorNode() {
        const color2D = this.time.node.getComponent(ColorAssembler2D);
        color2D.colors = [
            cc.Color.WHITE.fromHEX("#fe2b2b"),
            cc.Color.WHITE.fromHEX("#fe2b2b"),
            cc.Color.WHITE.fromHEX("#ffffff"),
            cc.Color.WHITE.fromHEX("#ffffff")
        ];

        color2D.updateColors();
    }

    updateDefaultColorNode() {
        const color2D = this.time.node.getComponent(ColorAssembler2D);
        color2D.colors = [
            cc.Color.WHITE.fromHEX("#ffaa00"),
            cc.Color.WHITE.fromHEX("#ffaa00"),
            cc.Color.WHITE.fromHEX("#ffe400"),
            cc.Color.WHITE.fromHEX("#ffe400")
        ];

        color2D.updateColors();
    }
}
