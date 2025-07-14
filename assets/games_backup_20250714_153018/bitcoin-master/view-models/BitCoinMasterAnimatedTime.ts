import AnimatedTime from "../../../common/animated-time/view-models/AnimatedTime";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BitCoinMasterAnimatedTime extends AnimatedTime {
    @property(cc.Sprite)
    progressCircleBar: cc.Sprite = null;

    protected placeBet = 45;
    protected waitingCandleResult = 60;
    protected showResult = 15;

    updateProgress(time: number, part: number) {
        switch (part) {
            case 0:
                this.updateData(time, this.placeBet);
                break;
            case 1:
                this.updateData(time, this.waitingCandleResult);
                break;
            case 2:
                this.updateData(time, this.showResult);
                break;
        }
    }

    updateData(time: number, partTime: number) {
        const value = time / partTime;
        this.progressCircleBar.fillRange = -value;
    }
}
