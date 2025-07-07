const { ccclass, property } = cc._decorator;

@ccclass
export default class FixedShapeButton extends cc.Button {
    @property(cc.PolygonCollider)
    collider: cc.PolygonCollider = null;

    start() {
        // Open the collision manager, without this part statement you will not detect any collision.
        cc.director.getCollisionManager().enabled = true;
    }

    _onTouchBegan(event) {
        const touch = event.touch;
        const touchLoc = touch.getLocation();
        if (!cc.Intersection.pointInPolygon(touchLoc, this.collider.world.points)) {
            return;
        }

        super._onTouchBegan(event);
    }

    _onTouchMove(event) {
        const touch = event.touch;
        const touchLoc = touch.getLocation();
        if (!cc.Intersection.pointInPolygon(touchLoc, this.collider.world.points)) {
            return;
        }

        super._onTouchMove(event);
    }
}
