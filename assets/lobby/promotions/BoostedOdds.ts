import PromotionNotificationsHandler, { PromotionNotificationsEvent } from "./PromotionNotificationsHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoostedOdds extends cc.Component {
    @property(cc.Node)
    icon: cc.Node = null;

    handleBoostedOdds() {
        cc.tween(this.icon)
            .call(() => (this.icon.active = true))
            .delay(10)
            .call(() => (this.icon.active = false))
            .start();
    }

    onDisable() {
        this.node.stopAllActions();
    }

    onClickBoostedOdds() {
        PromotionNotificationsHandler.getInstance().emit(PromotionNotificationsEvent.OPEN_ANNOUNCEMENT);
    }
}
