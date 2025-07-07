import CommonDialog from "../../common/_base/view-models/CommonDialog";
import { buildGameGuideUrl } from "../helpers/UrlHelper";
import LoadWebView from "../LoadWebView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WebViewVerification extends LoadWebView {
    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    @property(cc.Label)
    lblRound: cc.Label = null;

    @property()
    themeName = "blue";

    onLoad() {
        super.onLoad();
        if (this.commonDialog) {
            this.commonDialog.addOnDidHide(() => {
                this.node.destroy();
            });
        }
    }

    initURLVerification(gameId: number, language: string) {
        const params = {
            gId: gameId,
            t: "pf",
            v: Date.now()
        };
        const queryString = Object.keys(params)
            .map((key) => `${key}=${params[key]}`)
            .join("&");
        const domain = buildGameGuideUrl();

        this.url = `${domain}/${language}/pf?${queryString}`;
    }

    setURL(url: string) {
        const domain = buildGameGuideUrl();
        this.url = `${domain}${url}`;
    }

    setRoundId(roundId: number) {
        this.lblRound.string = roundId.toString();
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
