import GameUtils from "../../../common/GameUtils";
import CascadingSlotTicketDetailItem from "./CascadingSlotTicketDetailItem";
import CascadingSlotTumbleItem from "./CascadingSlotTumbleItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingSlotTicketDetailItem extends CascadingSlotTicketDetailItem {
    private readonly MIN_HEIGHT_TOTALROW_MOBILE = 250;
    private readonly HEIGHT_ROW_MOBILE = 125;
    mainAtlas: cc.SpriteAtlas;

    getMinHeightRow() {
        return GameUtils.isPhone() ? this.MIN_HEIGHT_TOTALROW_MOBILE : this.MIN_HEIGHT_TOTALROW;
    }

    getHeightRow() {
        return GameUtils.isPhone() ? this.HEIGHT_ROW_MOBILE : this.HEIGHT_ROW;
    }

    getMainAtlas(control: CascadingSlotTumbleItem) {
        control.mainAtlas = this.mainAtlas;
    }
}
