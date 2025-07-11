import BaseMicrositeGame from "../../common/BaseMicrositeGame";
import AudioManager from "../../common/audio/AudioManager";
import * as AuthManager from "../../common/auth/AuthManager";
import * as SessionManager from "../../common/auth/SessionManager";
import EncryptUtils from "../../common/utils/EncryptUtils";
import { appManager } from "../../managers/AppManager";

console.log("[MicrositeGame] Loading MicrositeGame module...");

const { ccclass } = cc._decorator;

@ccclass
export default class MicrositeGame extends BaseMicrositeGame {
    protected getMicrositeGameQueryString() {
        console.log("[MicrositeGame] Getting microsite game query string...");
        const auData = SessionManager.getSession();
        console.log("[MicrositeGame] Session data retrieved:", !!auData);

        if (!auData.ss) {
            console.warn("[MicrositeGame] No session SS found, returning empty query string");
            return "";
        }

        console.log("[MicrositeGame] Processing session parameters...");
        const directMode = SessionManager.getDirectMode();
        const operator = SessionManager.getOperator();
        const audio = AudioManager.getInstance();
        const validDirectMode = appManager.isDirectMode;

        console.log("[MicrositeGame] Direct mode:", directMode);
        console.log("[MicrositeGame] Operator:", operator);
        console.log("[MicrositeGame] Valid direct mode:", validDirectMode);
        cc.log("========================= validDirectMode     ", validDirectMode);

        const params = {
            ss: auData.ss,
            uname: auData.username,
            lang: auData.language,
            appType: auData.system,
            ref: validDirectMode ? directMode?.ref : "",
            rurl:
                validDirectMode && appManager.checkDirectModeRefData(directMode?.ref)
                    ? directMode?.returnUrl
                    : EncryptUtils.base64Encode(window.location.href),
            purl: EncryptUtils.base64Encode(window.location.href),
            musicEnable: audio.musicEnabled,
            sfxEnable: audio.sfxEnabled,
            isUserGesture: audio.isUserGesture,
            op: operator,
            isStandalone: false
        };

        console.log("[MicrositeGame] Parameters prepared:", params);

        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
            if (params[key] !== undefined) {
                searchParams.append(key, params[key]);
                console.log("[MicrositeGame] Added parameter:", key, "=", params[key]);
            }
        });

        const queryString = searchParams.toString();
        console.log("[MicrositeGame] Query string:", queryString);

        const encodedQueryString = EncryptUtils.base64Encode(queryString);
        console.log("[MicrositeGame] Encoded query string:", encodedQueryString);

        const finalQueryString = `?params=${encodedQueryString}`;
        console.log("[MicrositeGame] Final query string:", finalQueryString);

        return finalQueryString;
    }

    protected async updateSession(data) {
        console.log("[MicrositeGame] Updating session with data:", data);
        const session = AuthManager.updateSession(SessionManager.getSession(), data);
        console.log("[MicrositeGame] Session updated:", session);

        AuthManager.setAuthorizeInfo(session);
        console.log("[MicrositeGame] Authorization info set");

        AuthManager.setRecheckInInterval();
        console.log("[MicrositeGame] Recheck-in interval set");

        console.log("[MicrositeGame] Authorizing by user service...");
        appManager.authorized = await appManager.authorizeByUserService();
        console.log("[MicrositeGame] Authorization result:", appManager.authorized);
    }

    protected loadLobbyScene() {
        console.log("[MicrositeGame] Loading lobby scene...");
        cc.director.loadScene("Lobby", async () => {
            console.log("[MicrositeGame] Lobby scene loaded, handling back from microsite game...");
            await this.handleBackFromMicrositeGame();
            console.log("[MicrositeGame] Back from microsite game handled");
        });
        console.log("[MicrositeGame] Lobby scene load initiated");
    }

    onDestroy(): void {
        console.log("[MicrositeGame] MicrositeGame onDestroy called");
        this.setCanvasVisibilty(true);
        console.log("[MicrositeGame] Canvas visibility set to true");
        super.onDestroy();
        console.log("[MicrositeGame] MicrositeGame destroyed");
    }
}

console.log("[MicrositeGame] MicrositeGame module loaded successfully");
