import BaseMicrositeGame from "../../common/BaseMicrositeGame";
import AudioManager from "../../common/audio/AudioManager";
import * as AuthManager from "../../common/auth/AuthManager";
import * as SessionManager from "../../common/auth/SessionManager";
import EncryptUtils from "../../common/utils/EncryptUtils";
import { appManager } from "../../managers/AppManager";

const { ccclass } = cc._decorator;

@ccclass
export default class MicrositeGame extends BaseMicrositeGame {
    protected getMicrositeGameQueryString() {
        const auData = SessionManager.getSession();
        if (!auData.ss) {
            return "";
        }
        const directMode = SessionManager.getDirectMode();
        const operator = SessionManager.getOperator();
        const audio = AudioManager.getInstance();
        const validDirectMode = appManager.isDirectMode;
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

        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => params[key] !== undefined && searchParams.append(key, params[key]));
        const encodedQueryString = EncryptUtils.base64Encode(searchParams.toString());
        return `?params=${encodedQueryString}`;
    }

    protected async updateSession(data) {
        const session = AuthManager.updateSession(SessionManager.getSession(), data);
        AuthManager.setAuthorizeInfo(session);
        AuthManager.setRecheckInInterval();
        appManager.authorized = await appManager.authorizeByUserService();
    }

    protected loadLobbyScene() {
        cc.director.loadScene("Lobby", async () => {
            await this.handleBackFromMicrositeGame();
        });
    }

    onDestroy(): void {
        this.setCanvasVisibilty(true);
        super.onDestroy();
    }
}
