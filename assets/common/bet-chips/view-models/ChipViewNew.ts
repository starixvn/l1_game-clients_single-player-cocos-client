import ChipView, { ChipDisplayType } from "./ChipView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChipViewNew extends ChipView {
    @property({ type: cc.Sprite, visible: false, override: true })
    border: cc.Sprite = null;

    @property({ type: cc.SpriteFrame, visible: false, override: true })
    centerFrames: cc.SpriteFrame[] = [];

    @property({ type: cc.SpriteFrame, visible: false, override: true })
    borderFrames: cc.SpriteFrame[] = [];

    @property({ type: cc.Node, visible: false, override: true })
    typeNodes: cc.Node[] = [];

    @property(cc.Node)
    firstChipShadow: cc.Node = null;

    @property()
    private _rotation = 0;

    @property()
    public get rotation(): number {
        return this._rotation;
    }

    public set rotation(value: number) {
        this._rotation = value;
        this.updateRotation();
    }

    @property()
    private _scaleX = 0;

    @property()
    public get scaleX(): number {
        return this._scaleX;
    }

    public set scaleX(value: number) {
        this._scaleX = value;
        this.updateScaleX();
    }

    @property()
    private _scaleY = 0;

    @property()
    public get scaleY(): number {
        return this._scaleY;
    }

    public set scaleY(value: number) {
        this._scaleY = value;
        this.updateScaleY();
    }

    @property()
    private _skewY = 0;

    @property()
    public get skewY(): number {
        return this._skewY;
    }

    public set skewY(value: number) {
        this._skewY = value;
        this.updateSkewY();
    }

    @property()
    private _rotationNode = 0;

    @property()
    public get rotationNode(): number {
        return this._rotationNode;
    }

    public set rotationNode(value: number) {
        this._rotationNode = value;
        this.updateRotationNode();
    }

    setType(type: ChipDisplayType) {
        this.type = type;
    }

    protected updateRotation(): void {
        this.background.angle = -this.rotation;
        this.center.node.angle = -this.rotation;
    }

    protected updateScaleX(): void {
        this.background.scaleX = this.scaleX;
        this.center.node.scaleX = this.scaleX;
    }

    protected updateScaleY(): void {
        this.background.scaleY = this.scaleY;
        this.center.node.scaleY = this.scaleY;
    }

    protected updateSkewY(): void {
        this.background.skewY = this.skewY;
        this.center.node.skewY = this.skewY;
    }

    protected updateRotationNode() {
        this.node.angle = this.rotationNode;
    }

    initChipValue(angle, scaleX, scaleY, offset) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.rotation = angle;
        this.center.node.y = offset;
    }

    setColor(color: cc.Color) {
        super.setColor(color);
        this.center.node.color = color;
    }
}
