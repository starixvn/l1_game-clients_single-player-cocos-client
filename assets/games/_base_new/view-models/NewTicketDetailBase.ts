import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import LoadWebView from "../../../common/LoadWebView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewTicketDetailBase extends LoadWebView {
    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    onLoad() {
        super.onLoad();
        if (this.commonDialog) {
            this.commonDialog.addOnDidHide(() => {
                this.node.destroy();
            });
        }
    }

    setURL(url: string) {
        this.url = url;
    }

    loadWebView() {
        if (this.url) {
            this.showLoading();
            this.hideWebView();
            this.webView._impl.setVisible(true);

            this.webView.url = this.url;
        }
    }
}
