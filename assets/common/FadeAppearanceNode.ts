const { ccclass, property } = cc._decorator;

@ccclass
export default class FadeAppearanceNode extends cc.Component {
    @property
    appearanceDuration = 0.2;

    onHidden = () => {};
    isShowing = false;

    private appearanceTween: cc.Tween;

    showViewQuickly(show: boolean) {
        this.isShowing = show;
        this.node.opacity = show ? 255 : 0;
    }

    showView(show: boolean, force = false) {
        return new Promise<void>((resolve) => {
            const duration = this.appearanceDuration;
            if (show) {
                if (!this.isShowing || force) {
                    this.isShowing = true;
                    this.appearanceTween && this.appearanceTween.stop();
                    this.appearanceTween = cc
                        .tween(this.node)
                        .to(duration, { opacity: 255 })
                        .call(() => resolve())
                        .start();
                } else {
                    resolve();
                }
            } else {
                if (this.isShowing || force) {
                    this.isShowing = false;
                    this.appearanceTween && this.appearanceTween.stop();
                    this.appearanceTween = cc
                        .tween(this.node)
                        .to(duration, { opacity: 0 })
                        .call(() => this.onHidden())
                        .call(() => resolve())
                        .start();
                } else {
                    resolve();
                }
            }
        });
    }
}
