import * as AuthManager from "../../common/auth/AuthManager";
import * as SessionManager from "../../common/auth/SessionManager";
import BaseMicrositeGame from "../../common/BaseMicrositeGame";
import EncryptUtils from "../../common/utils/EncryptUtils";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { UrlInfo } from "../../managers/UrlInfo";

const { ccclass } = cc._decorator;

@ccclass
export default class MicrositeGameWebView extends BaseMicrositeGame {
    protected getMicrositeGameQueryString() {
        console.log("🌐 [MicrositeGameWebView] Getting microsite game query string");
        const urlParams = appManager.urlParams;
        if (urlParams.has("token")) {
            console.log("🌐 [MicrositeGameWebView] Token found in URL, building query string");
            const mainUrl = EncryptUtils.base64Encode(window.location.href);
            const existDirectModeInfo = urlParams.has(UrlInfo.Ref) && appManager.checkDirectModeRefData(urlParams.get(UrlInfo.Ref));
            const returnMainLobbyUrl = existDirectModeInfo ? "" : `&rurl=${mainUrl}`;
            const queryString = `?${urlParams.toString()}${returnMainLobbyUrl}&purl=${mainUrl}`;
            console.log("🌐 [MicrositeGameWebView] Query string built:", queryString);
            return queryString;
        } else {
            console.log("🌐 [MicrositeGameWebView] No token in URL, returning empty query string");
            return "";
        }
    }

    protected async updateSession(session) {
        console.log("🌐 [MicrositeGameWebView] Updating session:", session);
        AuthManager.updateSession(SessionManager.getSession(), session);
        SessionManager.removeDirectMode();
        console.log("🌐 [MicrositeGameWebView] Session updated and direct mode removed");
    }

    protected loadLobbyScene() {
        console.log("🌐 [MicrositeGameWebView] Loading lobby scene");
        uiManager.emitter.emit(InternalEvents.MICROSITE_BACK_TO_LOBBY);
    }

    protected async onClickJoinGame(gameId: number) {
        console.log("🌐 [MicrositeGameWebView] Join game clicked for game ID:", gameId);
        uiManager.emitter.emit(InternalEvents.MICROSITE_OPEN_GAME_BACK_FROM_LOBBY, gameId);
    }
}
