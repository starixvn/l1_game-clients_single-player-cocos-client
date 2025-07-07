const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class CardLayout extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    shadow: cc.Node = null;

    @property
    movingOffsetX = 0;

    @property
    _spacingX = 20;

    @property
    get spacingX() {
        return this._spacingX;
    }

    set spacingX(value) {
        this._spacingX = value;
        this.updateLayout();
    }

    @property
    _ratio = 0.9;

    @property
    get ratio() {
        return this._ratio;
    }

    set ratio(value) {
        this._ratio = value;
        this.updateLayout();
    }

    @property
    selectedPosY = 36;

    @property
    selectedPosZ = 60;

    @property
    updatedShadowWidth = true;

    @property
    cardViewScaleY = 1.15;

    cardSizeWidth = 76;
    public selectedRotationX = 20;
    _selected = undefined;
    shadowWidth = 100;

    onLoad() {
        if (CC_EDITOR) {
            this.content.on(cc.Node.EventType.CHILD_ADDED, this.updateLayout, this);
            this.content.on(cc.Node.EventType.CHILD_REMOVED, this.updateLayout, this);
            this.content.on(cc.Node.EventType.CHILD_REORDER, this.updateLayout, this);
            this.updateLayout();
        } else {
            this.content.removeAllChildren();
        }
    }

    updateLayout() {
        let width = 0;
        const halfCardSize = this.cardSizeWidth / 2;
        this.content.children.forEach((child, index) => {
            child.zIndex = index;
            child.x = halfCardSize + this.ratio * index * this.spacingX;
            if (this._selected) {
                child.x += this.movingOffsetX;
                child.y = this.selectedPosY;
                child.z = this.selectedPosZ;
            }
        });

        width = this.cardSizeWidth + this.ratio * (this.content.childrenCount - 1) * this.spacingX;
        this.content.width = 0; //FIXBUG: do this, to fix bug not call event SIZE_CHANGED
        this.content.width = width;
        if (this.updatedShadowWidth) {
            this.shadow.width = width + this.shadowWidth;
        }
    }

    calculatePosition(offsetX, isDrawFirstCard = false) {
        const halfCardSizeWidth = this.cardSizeWidth / 2;
        const contentChildrenCount = isDrawFirstCard ? 0 : this.content.childrenCount;

        let x = halfCardSizeWidth + this.ratio * contentChildrenCount * this.spacingX + offsetX;
        let y = 0;
        let z = 0;

        if (this._selected) {
            x += this.movingOffsetX;
            y = this.selectedPosY;
            z = this.selectedPosZ;
        }

        return cc.v3(x, y, z);
    }

    getNextPosition(isDrawFirstCard = false): cc.Vec3 {
        return this.calculatePosition(this.spacingX * 2, isDrawFirstCard);
    }

    getFinalPosition(isDrawFirstCard = false): cc.Vec3 {
        return this.calculatePosition(0, isDrawFirstCard);
    }

    changeCardView(selected: boolean): Promise<void> {
        return new Promise<void>((resolve) => {
            const needChange = this._selected !== selected;
            if (this._selected !== undefined && !needChange) {
                resolve();
                return;
            }
            this._selected = selected;
            if (selected) {
                this.content.children.forEach((child, index) => {
                    child.is3DNode = true;
                    child.stopAllActions();

                    cc.tween(child)
                        .delay(0.1 * (this.content.childrenCount - 1 - index))
                        .parallel(
                            cc.tween(child).by(0.3, { x: this.movingOffsetX }),
                            cc.tween(child).to(
                                0.3,
                                {
                                    rotationX: this.selectedRotationX,
                                    y: this.selectedPosY,
                                    z: this.selectedPosZ,
                                    scaleY: this.cardViewScaleY
                                },
                                { easing: "sineIn" }
                            )
                        )
                        .call(() => resolve())
                        .start();
                });
            } else {
                this.content.children.forEach((child, index) => {
                    child.is3DNode = true;
                    const isLastChild = index === this.content.childrenCount - 1;
                    child.stopAllActions();
                    cc.tween(child)
                        .delay(0.1 * index)
                        .parallel(
                            cc.tween(child).by(0.3, { x: -this.movingOffsetX }),
                            cc.tween(child).to(0.3, { rotationX: 0, y: 0, z: 0, scaleY: 1 })
                        )
                        .call(() => {
                            if (isLastChild) {
                                this.updateLayout();
                            }
                            resolve();
                        })
                        .start();
                });
            }
        });
    }
}
