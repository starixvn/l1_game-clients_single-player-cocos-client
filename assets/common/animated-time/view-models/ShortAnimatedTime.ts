import * as moment from "moment";

import AnimatedTime from "./AnimatedTime";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShortAnimatedTime extends AnimatedTime {
    @property(cc.Label)
    firstMinuteChar: cc.Label = null;

    @property(cc.Label)
    secondMinuteChar: cc.Label = null;

    setTime(time: string, forceChangeColor = false) {
        this.node.active = true;
        const timeChars = this.getTimeChars(time);

        this.firstMinuteChar && this.showTimeNumber(this.firstMinuteChar, timeChars[0]);
        this.secondMinuteChar && this.showTimeNumber(this.secondMinuteChar, timeChars[1]);
        this.firstChar && this.showTimeNumber(this.firstChar, timeChars[3]);
        this.secondChar && this.showTimeNumber(this.secondChar, timeChars[4]);

        const colorChange = forceChangeColor || (this.timeToChangeColor !== undefined && parseInt(time) <= this.timeToChangeColor);
        this.firstChar.node.color = colorChange ? this.changedColor : cc.Color.WHITE;
        this.secondChar.node.color = this.firstChar.node.color;
        this.firstMinuteChar.node.color = this.firstChar.node.color;
        this.secondMinuteChar.node.color = this.firstChar.node.color;
    }

    resetTime() {
        this.firstMinuteChar.string = "0";
        this.secondMinuteChar.string = "0";
        this.firstChar.string = "0";
        this.secondChar.string = "0";
    }

    getTimeChars(time: string): string[] {
        const timeText = moment.utc(parseInt(time) * 1000).format("mm:ss");
        return Array.from(timeText);
    }

    protected showTimeNumber(timeLabel: cc.Label, time: string) {
        if (time === timeLabel.string) {
            return;
        }

        timeLabel.string = time;
        this.handleBetTimeAnimation(timeLabel.node);
    }
}
