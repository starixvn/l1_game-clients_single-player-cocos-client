import * as moment from "moment";

import ShortAnimatedTime from "./ShortAnimatedTime";

const { ccclass, property } = cc._decorator;
@ccclass
export default class HhmmssAnimatedTime extends ShortAnimatedTime {
    @property(cc.Label)
    firstHourChar: cc.Label = null;

    @property(cc.Label)
    secondHourChar: cc.Label = null;

    @property(cc.Node)
    hourColon: cc.Node = null;

    private enableHour = false;
    private readonly numberMoveTime = 0.4;

    init(enableHour: boolean, animatedYTop = 60, animatedYBottom = -10) {
        this.enableHour = enableHour;

        if (enableHour) {
            this.firstHourChar.node.parent.parent.active = true;
            this.secondHourChar.node.parent.parent.active = true;
            this.hourColon.active = true;
        }

        this.setAnimatedY(animatedYTop, animatedYBottom);
    }

    getTimeChars(time: string): string[] {
        const timeText = moment.utc(parseInt(time) * 1000).format("HH:mm:ss");
        return Array.from(timeText);
    }

    setTime(time: string, forceChangeColor = false) {
        this.node.active = true;
        const timeChars = this.getTimeChars(time);

        this.firstHourChar && this.showTimeNumber(this.firstHourChar, timeChars[0]);
        this.secondHourChar && this.showTimeNumber(this.secondHourChar, timeChars[1]);
        this.firstMinuteChar && this.showTimeNumber(this.firstMinuteChar, timeChars[3]);
        this.secondMinuteChar && this.showTimeNumber(this.secondMinuteChar, timeChars[4]);
        this.firstChar && this.showTimeNumber(this.firstChar, timeChars[6]);
        this.secondChar && this.showTimeNumber(this.secondChar, timeChars[7]);
    }

    resetTime() {
        super.resetTime();
        this.firstHourChar.string = "0";
        this.secondHourChar.string = "0";
    }
}
