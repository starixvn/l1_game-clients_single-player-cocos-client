import * as i18n from "i18n/runtime-scripts/LanguageData";
import CommonDialog from "../../../../common/_base/view-models/CommonDialog";
import { getLanguage, getLocale } from "../../../../common/auth/SessionManager";
import WebViewGuide from "../../../../common/webview-guide/WebViewGuide";
import MiniPanel from "../../../../mini-games-panel/view-models/MiniPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ProvablyFairComponentBase extends cc.Component {
    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    @property(cc.Prefab)
    guideProvablyFairPrefab: cc.Prefab = null;

    @property(cc.Node)
    hintCopyNode: cc.Node = null;

    protected gameId = 0;
    private _themeGuide = "pf";
    protected hintLabel: cc.Label = null;
    public miniPanel: MiniPanel = null;

    callbackHandle() {
        // handle
    }

    updateGameId(gameId: number) {
        this.gameId = gameId;
    }

    updateThemeGuide(theme: string) {
        this._themeGuide = theme;
    }

    onLoad() {
        this.commonDialog.addOnDidHide(() => {
            this.statusNode(false);
        });
    }

    onShow() {
        this.statusNode(true);
        this.commonDialog.showDialog();
    }

    onHide() {
        this.commonDialog.closeDialogWithoutAnim();
        this.statusNode(false);
    }

    statusNode(active: boolean) {
        this.node.active = active;
    }

    onCloseClick() {
        this.commonDialog.closeDialog();
    }

    onGuideClick() {
        const dialog = cc.instantiate(this.guideProvablyFairPrefab);
        const guide = dialog.getComponent(WebViewGuide);
        guide.setURL(this.getUrlGuide());
        this.getContainerGuide().addChild(dialog);

        guide.loadWebView();
    }

    getContainerGuide() {
        return this.miniPanel?.dialog;
    }

    getUrlGuide(): string {
        const locale = getLocale();
        const language = getLanguage(locale);
        const dataId = `gameNames.${this.gameId}`;
        const gameName = `${i18n.t(dataId)}`;

        return `/${language}/?gId=${this.gameId}&t=${this._themeGuide}&displayName=${gameName}&c=0&f=pf&v=${Date.now()}`;
    }

    showHint(node: cc.Node) {
        cc.tween(node).to(0.2, { opacity: 255 }).delay(1).to(0.1, { opacity: 0 }).start();
    }

    getHintLabel(node: cc.Node) {
        return node.getChildByName("content").getComponent(cc.Label);
    }
}
