const { ccclass, property } = cc._decorator;

@ccclass
export default class EffectAppearanceLabel extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.RichText)
    richText: cc.RichText = null;

    @property(cc.Mask)
    mask: cc.Mask = null;

    @property
    speed = 400;

    private _value: string;
    set string(value: string) {
        this._value = value;
        const updated = (this.label && value !== this.label?.string) || (this.richText && value !== this.richText?.string);

        this.label && (this.label.string = value);
        this.richText && (this.richText.string = value);
        if (updated) {
            this.playAnimation();
        }
    }

    protected getContentWidth(): number {
        return this.label ? this.label.node.width : this.richText ? this.richText.node.width * this.richText.node.scaleX : 0;
    }

    protected calculateDistance(): number {
        const padding = 20;
        return !this._value.length ? 0 : this.getContentWidth() + padding;
    }

    public playAnimation() {
        this.mask.node.width = 0;

        const width = this.calculateDistance();
        if (!this.mask.node.activeInHierarchy) {
            this.mask.node.width = width;
            return;
        }
        const duration = width / this.speed;
        cc.tween(this.mask.node).to(duration, { width: width }).start();
    }
}
