import CallbackAnimation from "./CallbackAnimation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CallbackLoopAnimation extends CallbackAnimation {
    @property(cc.AnimationClip)
    loopClip: cc.AnimationClip = null;

    protected isLoopClip = false;
    private isFinished = false;
    private tapCount = 0;
    protected readonly delayFinishDuration = 2;

    public skipCallback = () => {};

    onLoad() {
        this.initHandleTouch();
        this.animation.on("finished", () => this.changeToLoopAnimation());
    }

    skipTouchToContinue() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.handleTouch, this);
        this.animation.on("finished", () => this.scheduleOnce(this.finish, this.delayFinishDuration));
    }

    closeLater() {
        this.scheduleOnce(this.finish, this.delayFinishDuration);
    }

    initHandleTouch() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.handleTouch, this);
    }

    handleTouch() {
        this.tapCount++;
        if (this.tapCount === 1) {
            this.skipCallback();
            if (!this.isLoopClip) {
                this.changeToLoopAnimation();
            }
            this.scheduleOnce(this.finish, this.delayFinishDuration);
        }
        if (this.tapCount === 2) {
            this.unschedule(this.finish);
            this.finish();
        }
    }

    changeToLoopAnimation() {
        this.isLoopClip = true;
        this.animation.addClip(this.loopClip);
        this.animation.play(this.loopClip.name);
    }

    finish() {
        if (this.isFinished) {
            return;
        }
        this.isFinished = true;
        this.onFinishedCallback();
        this.node.destroy();
    }
}
