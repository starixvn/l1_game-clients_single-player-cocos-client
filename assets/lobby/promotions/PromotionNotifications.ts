import { uiManager } from "../../managers/GameUIManager";
import PromotionNotificationsHandler, { PromotionNotificationsEvent } from "./PromotionNotificationsHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionNotifications extends cc.Component {
    @property(cc.Node)
    icon: cc.Node = null;

    @property(cc.Node)
    countNode: cc.Node = null;

    isReceivedPromotionData = false;

    onLoad() {
        PromotionNotificationsHandler.getInstance().on(PromotionNotificationsEvent.NEW_PROMOTION, this.showNotification.bind(this));

        if (PromotionNotificationsHandler.getInstance().promotionNotifications) {
            this.showNotification();
        }
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }

    showNotification() {
        const promotion = PromotionNotificationsHandler.getInstance().promotionNotifications;
        if (!this.icon || !this.countNode) {
            return;
        }
        this.icon.active = false;

        if (promotion?.length > 0) {
            this.isReceivedPromotionData = true;
            this.countNode.getChildByName("count").getComponent(cc.Label).string = promotion?.length.toString();
            this.checkToShowNotification();
        }
    }

    onClickNotification() {
        PromotionNotificationsHandler.getInstance().emit(PromotionNotificationsEvent.OPEN_ANNOUNCEMENT);
    }

    private checkToShowNotification() {
        if (!this.icon || !this.isReceivedPromotionData) {
            return;
        }
        this.icon.active = true;
    }
}
