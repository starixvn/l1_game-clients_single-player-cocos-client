import HoverItemBase from "../HoverItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomButton extends HoverItemBase {
    @property
    fixedShape = false;

    @property({
        type: cc.PolygonCollider,
        visible: function (this: CustomButton) {
            return this.fixedShape;
        }
    })
    collider: cc.PolygonCollider = null;

    @property
    parentControl = false;

    public callback = {
        highlight: (highlight: boolean) => {},
        selected: () => {}
    };

    checkCollider(event) {
        if (this.collider) {
            const touchLoc = event.getLocation();
            if (!cc.Intersection.pointInPolygon(touchLoc, this.collider.world.points)) {
                return false;
            }
        }

        return true;
    }

    onLoad() {
        cc.director.getCollisionManager().enabled = true;

        if (!this.parentControl) {
            super.onLoad();
        }
    }

    onDestroy() {
        if (!this.parentControl) {
            super.onDestroy();
        }
    }

    onTouchMove(e) {
        if (!this.checkCollider(e)) {
            this.setHighlight(false);
            return;
        }
        this.setHighlight(true);
    }

    onTouchEnd(e) {
        this.setHighlight(false);
        if (!this.checkCollider(e)) {
            return;
        }
        this.callback.selected();
    }

    onTouchCancel(e) {
        this.setHighlight(false);
    }
}
