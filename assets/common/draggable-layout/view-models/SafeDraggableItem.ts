import DraggableItem from './DraggableItem';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SafeDraggableItem extends DraggableItem {
    @property
    fixTopPadding = 0;

    start() {
        this.node.parent.on(cc.Node.EventType.SIZE_CHANGED, this.moveToEdge, this);
    }

    getCurrentSize(): cc.Vec2 {
        return cc.v2(this.node.width, this.node.height);
    }

    onTouchEnd(e) {
        super.onTouchEnd(e);
        this.moveToEdge();
    }

    onTouchCancel(e) {
        super.onTouchCancel(e);
        this.moveToEdge();
    }

    moveToEdge() {
        const width = this.node.parent.width;
        const height = this.node.parent.height;
        const size = this.getCurrentSize();
        const maxX = width / 2 - size.x / 2;
        const maxY = height / 2 - size.y / 2;
        const deltaWidth = maxX - Math.abs(this.node.x);
        const deltaHeight = maxY - Math.abs(this.node.y);

        let posX: number, posY: number;
        if (deltaWidth < deltaHeight) {
            posY = this.node.y;
            posY = Math.min(Math.max(-maxY, posY), maxY);
            posX = this.node.x < 0 ? -maxX : maxX;
        } else {
            posX = this.node.x;
            posX = Math.min(Math.max(-maxX, posX), maxX);
            posY = this.node.y < 0 ? -maxY : maxY;
        }

        posY = Math.min(maxY - this.fixTopPadding, posY);
        this.node.runAction(cc.moveTo(0.3, posX, posY).easing(cc.easeSineOut()));
    }
}
