const { ccclass, disallowMultiple, executeInEditMode, property } = cc._decorator;

export enum AutoScalePolicy {
    /** Matches parent's width, dynamic height. */
    MatchWidth = 0,

    /** Matches parent's height, dynamic width. */
    MatchHeight = 1,

    /** Fits parent's size. */
    FitContent = 2
}

/** Automatically scales to match parent's size. */
@ccclass
@disallowMultiple
@executeInEditMode
export class AutoScaleWidget extends cc.Component {
    @property({ type: cc.Enum(AutoScalePolicy) })
    private _policy = AutoScalePolicy.FitContent;

    @property({ type: cc.Enum(AutoScalePolicy) })
    public get policy(): AutoScalePolicy {
        return this._policy;
    }

    public set policy(value: AutoScalePolicy) {
        this._policy = value;
        this.updateDisplay();
    }

    public onEnable(): void {
        this.node.parent.on(cc.Node.EventType.SIZE_CHANGED, this.updateDisplay, this);
        this.node.on(cc.Node.EventType.SIZE_CHANGED, this.updateDisplay, this);
        this.updateDisplay();
    }

    public onDisable(): void {
        this.node.parent.off(cc.Node.EventType.SIZE_CHANGED, this.updateDisplay, this);
        this.node.off(cc.Node.EventType.SIZE_CHANGED, this.updateDisplay, this);
    }

    public update(delta: number): void {
        if (CC_EDITOR) {
            this.updateDisplay();
        }
    }

    protected updateDisplay(): void {
        if (this.policy === AutoScalePolicy.MatchHeight) {
            this.node.scale = this.node.parent.height / this.node.height;
        } else if (this.policy === AutoScalePolicy.MatchWidth) {
            this.node.scale = this.node.parent.width / this.node.width;
        } else {
            const scaleX = this.node.parent.width / this.node.width;
            const scaleY = this.node.parent.height / this.node.height;
            this.node.scale = Math.min(scaleX, scaleY);
        }
    }
}
