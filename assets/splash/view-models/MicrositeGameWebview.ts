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
        const urlParams = appManager.urlParams;
        if (urlParams.has("token")) {
            const mainUrl = EncryptUtils.base64Encode(window.location.href);
            const existDirectModeInfo = urlParams.has(UrlInfo.Ref) && appManager.checkDirectModeRefData(urlParams.get(UrlInfo.Ref));
            const returnMainLobbyUrl = existDirectModeInfo ? "" : `&rurl=${mainUrl}`;
            return `?${urlParams.toString()}${returnMainLobbyUrl}&purl=${mainUrl}`;
        } else {
            return "";
        }
    }

    protected async updateSession(session) {
        AuthManager.updateSession(SessionManager.getSession(), session);
        SessionManager.removeDirectMode();
    }

    protected loadLobbyScene() {
        uiManager.emitter.emit(InternalEvents.MICROSITE_BACK_TO_LOBBY);
    }

    protected async onClickJoinGame(gameId: number) {
        uiManager.emitter.emit(InternalEvents.MICROSITE_OPEN_GAME_BACK_FROM_LOBBY, gameId);
    }
}
