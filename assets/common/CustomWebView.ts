const WebViewImpl = require("./CustomWebViewImpl");

const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomWebView extends cc.WebView {
    _impl: any;

    constructor() {
        super();
        this._impl = new WebViewImpl();
    }

    setOpacity(opacity: number) {
        this.node.opacity = opacity;
        if (this._impl) {
            this._impl._setOpacity(opacity);
        }
    }

    disableDivScroll() {
        this._impl._div.style.overflow = "hidden";
    }
}
