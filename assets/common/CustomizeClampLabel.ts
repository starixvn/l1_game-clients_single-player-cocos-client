const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomizeClampLabel extends cc.Label {
    @property()
    paddingRight = 0;

    @property({
        override: true
    })
    get string(): string {
        return this._string;
    }

    set string(value: string) {
        if (this._string !== value) {
            this.overflow = cc.Label.Overflow.NONE;
            const oldValue = this._string;
            this._string = "" + value;

            if (this.string !== oldValue) {
                this.setVertsDirty();
            }

            this._checkStringEmpty();
        }
    }

    protected prevWidth = 0;

    update() {
        this.updateWidth();
    }

    updateWidth() {
        const currentWidth = this.node?.width;
        if (currentWidth !== this.prevWidth) {
            this.prevWidth = currentWidth + this.paddingRight;
            this.overflow = cc.Label.Overflow.CLAMP;
            this.node.width = currentWidth + this.paddingRight;
        }
    }
}
