import CustomWebView from "./CustomWebView";
import { buildGameGuideUrl } from "./helpers/UrlHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadWebView extends cc.Component {
    @property(CustomWebView)
    webView: CustomWebView = null;

    @property(cc.Node)
    loading: cc.Node = null;

    protected url: string;
    public needDisableDivScroll = false;

    protected onWebViewLoaded = () => {};

    onLoad() {
        this.webView.node.on(
            "loaded",
            () => {
                const paddingTime = 0.3;

                if (this.needDisableDivScroll) {
                    this.webView.disableDivScroll();
                }

                cc.tween(this.node)
                    .delay(paddingTime)
                    .call(() => {
                        this.hideLoading();

                        this.showWebView();
                    })
                    .start();
            },
            this
        );
    }

    showWebView() {
        this.webView._impl.setVisible(true);
        this.webView.setOpacity(255);
        this.onWebViewLoaded();
    }

    hideWebView() {
        this.webView.setOpacity(0);
        this.webView._impl.setVisible(false);
    }

    destroyDivIframe() {
        this.webView._impl.destroy();
    }

    showLoading() {
        this.loading.active = true;
    }

    hideLoading() {
        this.loading.active = false;
    }

    loadWebView() {
        if (this.url) {
            this.showLoading();

            this.webView.url = this.url;
        }
    }

    sendDataToIframe(configs: any) {
        const guideUrl = buildGameGuideUrl();
        this.onWebViewLoaded = () => {
            this.webView._impl._iframe.contentWindow.postMessage(JSON.stringify(configs), guideUrl);
        };
    }
}
