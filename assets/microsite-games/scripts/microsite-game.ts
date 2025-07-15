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
            console.warn("[MicrositeGame] No session SS found, returning empty query string");
            return "";
        }

        
        const directMode = SessionManager.getDirectMode();
        const operator = SessionManager.getOperator();
        const audio = AudioManager.getInstance();

        
        

        const params = {
            ss: auData.ss,
            uname: auData.username,
            lang: auData.language,
            appType: auData.system,
            ref: directMode?.ref || "",
            rurl: directMode?.returnUrl || EncryptUtils.base64Encode(window.location.href),
            purl: EncryptUtils.base64Encode(window.location.href),
            musicEnable: audio.musicEnabled,
            sfxEnable: audio.sfxEnabled,
            isUserGesture: audio.isUserGesture,
            op: operator,
            isStandalone: false
        };

        

        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => {
            if (params[key] !== undefined) {
                searchParams.append(key, params[key]);
                
            }
        });

        const queryString = searchParams.toString();
        

        const encodedQueryString = EncryptUtils.base64Encode(queryString);
        

        const finalQueryString = `?params=${encodedQueryString}`;
        

        return finalQueryString;
    }

    protected async updateSession(data) {
        
        const session = AuthManager.updateSession(SessionManager.getSession(), data);
        

        AuthManager.setAuthorizeInfo(session);
        

        AuthManager.setRecheckInInterval();
        

        
        appManager.authorized = await appManager.authorizeByUserService();
        
    }

    protected loadLobbyScene() {
        
        cc.director.loadScene("Splash", async () => {
            
            await this.handleBackFromMicrositeGame();
            
        });
        
    }

    onDestroy(): void {
        
        this.setCanvasVisibilty(true);
        
        super.onDestroy();
        
    }
}


