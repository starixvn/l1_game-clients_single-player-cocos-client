import * as i18n from "i18n/runtime-scripts/LanguageData";

import { lazyInject } from "../Application";
import { getGameConfiguration, initialize as initGameConfiguration, isGatewayGame, isMicroSite } from "../configs/GameConfigurations";
import { appManager } from "../managers/AppManager";
import { StorageManager } from "../managers/StorageManager";
import SocketIOController from "../SocketIOController";
import AudioManager from "./audio/AudioManager";
import MusicPlayer from "./audio/MusicPlayer";
import * as AuthManager from "./auth/AuthManager";
import NotificationService from "./auth/NotificationService";
import * as SessionManager from "./auth/SessionManager";
import CustomWebView from "./CustomWebView";
import GameUtils from "./GameUtils";
import { buildMicrositeGameUrl } from "./helpers/UrlHelper";
import JoinGameHelper from "./JoinGameHelper";

const { ccclass, property } = cc._decorator;

declare global {
    interface Window {
        microsite: any;
        isUserGesture: boolean;
    }
}

export type MicrositeGameParams = {
    backLobby?: boolean;
    ss?: string;
    time?: number;
    username?: string;
    isAuthenticated?: boolean;
    memberName?: string;
    language?: string;
    musicEnable?: boolean;
    sfxEnable?: boolean;
    sessionTimeout?: boolean;
    copyToClipboard?: string;
    hasSSO?: boolean;
    getGameName?: number;
    replaceUrl?: string;
    gameId?: number;
    promotion?: string;
    clearQueryStringOnUrl?: boolean;
    splashEnabled?: boolean;
    isUserGesture?: boolean;
    operator?: string;
    loadStorage?: { key: string };
    saveStorage?: { [key: string]: any };
    syncSession?: ISessionInfo;
};

interface ISessionInfo {
    isAuthenticated: boolean;
    username: string;
    language: string;
    session: string;
    system: number;
    memberName?: string;
    ssoTime?: Date;
}

const WebviewEventType = {
    LOADING: "loading"
};

@ccclass
export default class BaseMicrositeGame extends cc.Component {
    @property(CustomWebView)
    webview: CustomWebView = null;

    private readonly MusicStorageKey = "SOUND_BACKGROUND";
    private readonly SFXStorageKey = "SOUND_GAME";
    private micrositeUrl = "";
    private isLoadingLobby = false;

    @lazyInject(SocketIOController)
    private readonly socketIOControler: SocketIOController;

    protected gameId = 0;
    protected onLoad(): void {
        this.gameId = SessionManager.getMicrositeGameId();
        this.stopMainAction();
        this.loadMicrositeGame();
        window.addEventListener("message", this.handleEventFromMicrosite);
        this.webview?.node.on(
            WebviewEventType.LOADING,
            () => {
                this.webview._impl._iframe.id = "microsite";
            },
            this
        );
    }

    setCanvasVisibilty(active: boolean) {
        GameUtils.setCanvasVisibilty(active);
    }

    protected onDestroy(): void {
        window.microsite = {};
        this.removeMicrositeListeners();
    }

    private removeMicrositeListeners() {
        window.removeEventListener("message", this.handleEventFromMicrosite);
    }

    protected stopMainAction() {
        const audio = AudioManager.getInstance();
        audio.stopMusic();
        audio.stopAllSFX();
        const musicPlayer = MusicPlayer.getInstance();
        musicPlayer.stopBackgroundAudio();
        cc.log("stop main action -------------");
        NotificationService.getInstance().forceKickedOut();
        AuthManager.removeRecheckInInterval();
    }

    protected loadMicrositeGame() {
        this.micrositeUrl = buildMicrositeGameUrl(this.gameId);
        let queryString = this.getMicrositeGameQueryString();

        if (queryString && queryString.length > 0) {
            queryString += "&hideFullscreen=true";
        } else {
            queryString = "?hideFullscreen=true";
        }

        this.webview && (this.webview.url = `${this.micrositeUrl}/${queryString}`);
    }

    handleEventFromMicrosite = async ({ data }: { data: MicrositeGameParams }) => {
        if (data.replaceUrl) {
            window.location.replace(data.replaceUrl);
        }
        if (data.splashEnabled) {
            this.setCanvasVisibilty(false);
            this.handleUserGesturePage();
            this.handleClearStorage();
            const className = "microsite-iframe";
            !this.webview?._impl?._iframe?.classList?.contains(className) && this.webview?._impl?._iframe?.classList?.add(className);

            return;
        }
        if (data.hasSSO) {
            window.microsite = { hasSSO: true };
            return;
        }
        if (data.sessionTimeout) {
            this.handleSignOut();
            this.removeMicrositeListeners();
            return;
        }

        if (data.backLobby && !this.isLoadingLobby) {
            this.isLoadingLobby = true;
            this.setCanvasVisibilty(true);
            await this.handleBackToLobby(data);
            return;
        }
        if (data.getGameName) {
            this.getGameName(data.getGameName, data.language);
            return;
        }
        if (data.copyToClipboard) {
            this.handleCopyToClipboard(data.copyToClipboard);
            return;
        }
        if (data.clearQueryStringOnUrl) {
            AuthManager.clearQueryStringOnUrl();
        }
        if (data.isUserGesture) {
            AudioManager.getInstance().isUserGesture = true;
            window.isUserGesture = true;
        }
        if (data.loadStorage) {
            this.handleLoadStorage(data);
        }

        if (data.saveStorage) {
            this.handleSaveStorage(data);
        }

        if (data.syncSession) {
            this.syncSession(data.syncSession);
        }

        this.handleOperator();

        this.handleChangeAudio(data);
    };

    private syncSession(params: ISessionInfo) {
        if (!params) {
            return;
        }
        const session: any = SessionManager.getSession() || {};
        session.ss = params.session;
        session.isAuthenticated = params.isAuthenticated ?? false;
        session.memberName = params.memberName;
        session.username = params.username;
        session.language = params.language;
        session.system = params.system;
        session.time = params.ssoTime;
        SessionManager.storeSessionData(session);
    }

    private handleLoadStorage(data: MicrositeGameParams) {
        const { key } = data.loadStorage;
        cc.log("microsite load storage ", key);
        this.postMessageToMicrosite({
            loadStorage: {
                key: StorageManager.get(key)
            }
        });
    }

    private handleSaveStorage(data: MicrositeGameParams) {
        const storage = data.saveStorage;
        const keys = Object.keys(storage);
        cc.log("microsite save storage ", keys);
        for (const key of Object.keys(storage)) {
            StorageManager.set(key, storage[key]);
        }
    }

    protected getMicrositeGameQueryString() {
        return "";
    }

    protected async handleBackToLobby(data: MicrositeGameParams) {
        const currentGameId = this.gameId;
        SessionManager.removeMicrositeGameId();
        await this.updateSession(data);
        AudioManager.getInstance().initDefaultStorage();

        if (data.gameId > 0) {
            await this.onClickJoinGame(data.gameId);
            if (!isMicroSite(data.gameId)) {
                await this.handleBackFromMicrositeGame();
            }
            return;
        }

        if (isGatewayGame(currentGameId)) {
            const gameConfiguration = getGameConfiguration(currentGameId);
            const mainId = gameConfiguration.gateway?.id;

            const onConnected = async () => {
                await this.handleBackFromMicrositeGame();
            };
            GameUtils.openSocketGatewayGame(mainId, this.socketIOControler, onConnected);
            return;
        }

        this.loadLobbyScene();
    }

    protected async handleBackFromMicrositeGame() {
        await appManager.initNotificationService();
    }

    protected async updateSession(session: MicrositeGameParams) {
        //
    }

    protected loadLobbyScene() {
        //
    }

    private handleChangeAudio(data: MicrositeGameParams) {
        data.musicEnable !== undefined && StorageManager.set(this.MusicStorageKey, data.musicEnable);
        data.sfxEnable !== undefined && StorageManager.set(this.SFXStorageKey, data.sfxEnable);
    }

    private handleOperator() {
        const operator = SessionManager.getOperator();
        if (operator) {
            this.postMessageToMicrosite({ op: operator });
        }
    }

    private handleSignOut() {
        SessionManager.removeMicrositeGameId();
        SessionManager.removeSession();
    }

    private postMessageToMicrosite(data: any) {
        this.webview?._impl._iframe.contentWindow.postMessage(data, this.micrositeUrl);
    }

    private async handleCopyToClipboard(text: string) {
        const copySuccessfully = await GameUtils.copyText(text);
        this.postMessageToMicrosite({ copySuccessfully });
    }

    private async getGameName(gameId: number, language = "en") {
        window.gameConfigurations === undefined && (await initGameConfiguration());
        i18n.init(language);
        const gameName = await GameUtils.getDisplayGameName(gameId);
        this.postMessageToMicrosite({ gameName, gameId });
    }

    protected async onClickJoinGame(gameId: number) {
        const joinGameHelper = new JoinGameHelper();
        if (GameUtils.isMiniGame(gameId.toString())) {
            cc.director.loadScene("Lobby", () => {
                GameUtils.openGame(joinGameHelper.getGameId(gameId), appManager.miniPanel);
            });
        } else {
            await joinGameHelper.joinGameIsNotMiniGame(gameId, this.socketIOControler);
        }
    }

    private async handleClearStorage() {
        const isClearStorage = SessionManager.getClearStorageMicroSite();
        if (isClearStorage) {
            SessionManager.clearStorageMicroSite(false);
            this.postMessageToMicrosite({ isClearStorage });
        }
    }

    private async handleUserGesturePage() {
        const isUserGesture = AudioManager.getInstance().isUserGesture;
        this.postMessageToMicrosite({ isUserGesture });
    }
}
