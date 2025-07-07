import LoadWebView from "../../../common/LoadWebView";
import { freeSpinsPromotionHandler } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import FreeSpinsPromotionDialog from "./FreeSpinsPromotionDialog";

const CLOSE_FREE_SPINS_PROMOTION_EVENT = "closeFreeSpinsPromotionPopup";

const { ccclass, property } = cc._decorator;
@ccclass
export default class FreeSpinsPromotionWebView extends LoadWebView {
    @property(FreeSpinsPromotionDialog)
    freeSpinsPromotionDialog: FreeSpinsPromotionDialog = null;

    onLoad(): void {
        this.loadFreeSpinsPromotionSite();
        if (this.freeSpinsPromotionDialog) {
            this.freeSpinsPromotionDialog.addOnDidHide(() => {
                this.node.destroy();
            });
        }

        window.addEventListener("message", this.handleEvent, false);

        super.onLoad();
    }

    protected onDestroy(): void {
        window.removeEventListener("message", this.handleEvent);
    }

    handleEvent = async ({ data }: { data: string }) => {
        if (data === CLOSE_FREE_SPINS_PROMOTION_EVENT) {
            this.freeSpinsPromotionDialog.closeDialog();
        }
    };

    loadFreeSpinsPromotionSite() {
        this.showLoading();
        this.hideWebView();
        this.webView._impl.setVisible(true);

        const url = freeSpinsPromotionHandler.getFreeSpinsPromotionUrl();
        this.webView && (this.webView.url = url);
    }

    showWebView() {
        this.webView._impl.setVisible(true);
        this.webView.setOpacity(255);
    }
}
