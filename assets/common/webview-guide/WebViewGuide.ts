import CommonDialog from "../../common/_base/view-models/CommonDialog";
import { buildGameGuideUrl } from "../helpers/UrlHelper";
import LoadWebView from "../LoadWebView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WebViewGuide extends LoadWebView {
    @property(CommonDialog)
    commonDialog: CommonDialog = null;

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

    initURL(
        gameId: number,
        language: string,
        configStake: { minBet: number; maxBet: number; used: boolean },
        isInPromotionTime: boolean,
        fractionalOddsFormat = false,
        specialDirection = ""
    ) {
        const domain = buildGameGuideUrl();
        let url = `${domain}/${language}?gId=${gameId}&t=${
            this.themeName
        }&p=${isInPromotionTime}&f=sc&v=${Date.now()}&fof=${fractionalOddsFormat}`;
        url += `&minBet=${configStake.minBet}&maxBet=${configStake.maxBet}${specialDirection}`;
        this.url = url;
    }

    setURL(url: string) {
        const domain = buildGameGuideUrl();
        this.url = `${domain}${url}`;
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
