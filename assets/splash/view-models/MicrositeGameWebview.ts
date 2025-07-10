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
        console.log("🌐 [MicrositeGameWebView] ===== getMicrositeGameQueryString started =====");
        const startTime = Date.now();

        const urlParams = appManager.urlParams;
        console.log("🌐 [MicrositeGameWebView] URL parameters check:", {
            hasToken: urlParams.has("token"),
            hasGameId: urlParams.has("gameId"),
            hasOp: urlParams.has("op"),
            hasRef: urlParams.has("ref"),
            tokenValue: urlParams.get("token") ? "present" : "missing",
            gameIdValue: urlParams.get("gameId"),
            opValue: urlParams.get("op"),
            refValue: urlParams.get("ref")
        });

        if (urlParams.has("token")) {
            console.log("🌐 [MicrositeGameWebView] 🔐 Token found in URL, building query string");

            const mainUrl = EncryptUtils.base64Encode(window.location.href);
            console.log("🌐 [MicrositeGameWebView] Main URL encoded:", mainUrl);

            const existDirectModeInfo = urlParams.has(UrlInfo.Ref) && appManager.checkDirectModeRefData(urlParams.get(UrlInfo.Ref));
            console.log("🌐 [MicrositeGameWebView] Direct mode check:", {
                hasRef: urlParams.has(UrlInfo.Ref),
                refValue: urlParams.get(UrlInfo.Ref),
                isDirectMode: existDirectModeInfo
            });

            const returnMainLobbyUrl = existDirectModeInfo ? "" : `&rurl=${mainUrl}`;
            const queryString = `?${urlParams.toString()}${returnMainLobbyUrl}&purl=${mainUrl}`;

            console.log("🌐 [MicrositeGameWebView] Query string components:", {
                urlParamsString: urlParams.toString(),
                returnMainLobbyUrl,
                purl: mainUrl,
                finalQueryString: queryString
            });

            const endTime = Date.now();
            console.log("🌐 [MicrositeGameWebView] ===== getMicrositeGameQueryString completed in", (endTime - startTime), "ms =====");
            return queryString;
        } else {
            console.log("🌐 [MicrositeGameWebView] ❌ No token in URL, returning empty query string");
            const endTime = Date.now();
            console.log("🌐 [MicrositeGameWebView] ===== getMicrositeGameQueryString completed in", (endTime - startTime), "ms =====");
            return "";
        }
    }

    protected async updateSession(session) {
        console.log("🌐 [MicrositeGameWebView] ===== updateSession started =====");
        const startTime = Date.now();

        console.log("🌐 [MicrositeGameWebView] Updating session with new data:", {
            hasSession: !!session,
            sessionKeys: session ? Object.keys(session) : [],
            currentSession: SessionManager.getSession() ? Object.keys(SessionManager.getSession()) : []
        });

        AuthManager.updateSession(SessionManager.getSession(), session);
        console.log("🌐 [MicrositeGameWebView] ✅ Session updated via AuthManager");

        SessionManager.removeDirectMode();
        console.log("🌐 [MicrositeGameWebView] ✅ Direct mode removed from session");

        const endTime = Date.now();
        console.log("🌐 [MicrositeGameWebView] ===== updateSession completed in", (endTime - startTime), "ms =====");
    }

    protected async loadLobbyScene() {
        console.log("🌐 [MicrositeGameWebView] ===== loadLobbyScene started =====");
        const startTime = Date.now();

        console.log("🌐 [MicrositeGameWebView] Loading lobby scene from microsite...");
        uiManager.emitter.emit(InternalEvents.MICROSITE_BACK_TO_LOBBY);

        const endTime = Date.now();
        console.log("🌐 [MicrositeGameWebView] ===== loadLobbyScene completed in", (endTime - startTime), "ms =====");
    }

    protected async onClickJoinGame(gameId: number) {
        console.log("🌐 [MicrositeGameWebView] ===== onClickJoinGame started =====");
        const startTime = Date.now();

        console.log("🌐 [MicrositeGameWebView] Join game clicked for game ID:", gameId);
        console.log("🌐 [MicrositeGameWebView] Emitting MICROSITE_OPEN_GAME_BACK_FROM_LOBBY event");
        uiManager.emitter.emit(InternalEvents.MICROSITE_OPEN_GAME_BACK_FROM_LOBBY, gameId);

        const endTime = Date.now();
        console.log("🌐 [MicrositeGameWebView] ===== onClickJoinGame completed in", (endTime - startTime), "ms =====");
    }
}
