const { ccclass, property } = cc._decorator;

@ccclass
export default class BounceInEffect extends cc.Component {
    @property({ override: true })
    time = 0.5;

    private originScale: number;

    public autoZooming = true;

    onLoad() {
        this.originScale = this.node.scale;
    }

    onEnable() {
        this.node.opacity = 0;
        if (this.autoZooming) {
            cc.tween(this.node)
                .delay(0)
                .call(() => this.zooming())
                .start();
        }
    }

    zooming() {
        return new Promise<void>((resolve) => {
            this.node.scale = 0;
            cc.tween(this.node)
                .to(this.time, { scale: this.originScale, opacity: 255 }, { easing: "backOut" })
                .call(() => resolve())
                .start();
        });
    }

    onDisable() {
        this.node.stopAllActions();
        this.node.opacity = 0;
    }
}
