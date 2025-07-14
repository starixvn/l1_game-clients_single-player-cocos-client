import AudioManager from "../../../common/audio/AudioManager";
import { getLanguage, getLocale } from "../../../common/auth/SessionManager";
import { userManager } from "../../../common/user/UserManager";
import WebViewGuide from "../../../common/webview-guide/WebViewGuide";
import { MegaKeno1Id } from "./MegaKenoConfig";

const { ccclass, property } = cc._decorator;
@ccclass
export default class MegaKenoGuide extends cc.Component {
    @property(WebViewGuide)
    content: WebViewGuide = null;

    @property(cc.Node)
    mainFrame: cc.Node = null;

    public games = {};

    onLoad() {
        const commonDialog = this.mainFrame.getComponent("CommonDialog");
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }

    start() {
        this.select(MegaKeno1Id);
    }

    selectGame(event, game) {
        this.select(game);
    }

    select(gameId: number) {
        AudioManager.getInstance().playClick();
        const game = this.games[gameId];
        const { minBet, maxBet } = game.getBetRange();
        const locale = getLocale();
        const language = getLanguage(locale);
        this.content.initURL(
            gameId,
            language,
            { minBet, maxBet, used: game.isUsingMaxStakeLevel() },
            false,
            userManager.fractionalOddsFormat
        );
        this.content.sendDataToIframe(game.gameConfigs);
        this.content.loadWebView();
    }
}
