const { ccclass, property } = cc._decorator;

@ccclass
export default class CallbackAnimation extends cc.Component {
    @property(cc.Animation)
    animation: cc.Animation = null;

    public onFinishedCallback = () => {};
    public autoDestroyNode = true;
    onLoad() {
        this.animation.on("finished", () => this.finish());
    }

    setDuration(duration: number) {
        if (!this.node.isValid) {
            return;
        }
        const original = this.animation.defaultClip.duration;
        this.animation.defaultClip.speed = original / duration;
    }

    play() {
        this.animation?.play();
    }

    finish() {
        this.onFinishedCallback();
        this.autoDestroyNode && this.node?.destroy();
    }
}
